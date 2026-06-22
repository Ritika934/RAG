import { buildEmbeddings, getPineconeIndex } from "../indexing.js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL_PRIMARY,
  process.env.GEMINI_MODEL_FALLBACK,
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
];
const FALLBACK_MESSAGE =
  "AI service temporarily unavailable, please try again later.";

let geminiModelListPromise;

function logErrorDetails(label, error) {
  console.error(label, {
    message: error?.message,
    name: error?.name,
    stack: error?.stack,
    cause: error?.cause,
    details: error?.response?.data || error?.details,
  });
}

function normalizeResponseContent(content) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (typeof item?.text === "string") {
          return item.text;
        }

        return "";
      })
      .join("")
      .trim();
  }

  return "";
}

function getCandidateGeminiModels() {
  return [...new Set(GEMINI_MODELS.filter(Boolean))];
}

async function listAvailableGeminiModels() {
  const googleApiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!googleApiKey) {
    return [];
  }

  if (!geminiModelListPromise) {
    geminiModelListPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${googleApiKey}`
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Gemini models.list failed with status ${response.status}`);
        }

        return response.json();
      })
      .then((data) =>
        (data?.models || [])
          .filter((model) =>
            Array.isArray(model?.supportedGenerationMethods)
              ? model.supportedGenerationMethods.includes("generateContent")
              : false
          )
          .map((model) => model.name?.replace("models/", ""))
          .filter(Boolean)
      )
      .catch((error) => {
        logErrorDetails("Gemini models.list failed:", error);
        return [];
      });
  }

  return geminiModelListPromise;
}

export const queryRAG = async (question, clerkId, documentId) => {
  const safeQuestion = typeof question === "string" ? question.trim() : "";
  const safeClerkId = typeof clerkId === "string" ? clerkId.trim() : "";
  const safeDocumentId =
    documentId === undefined || documentId === null ? null : String(documentId);
  const numericDocumentId =
    safeDocumentId !== null && !Number.isNaN(Number(safeDocumentId))
      ? Number(safeDocumentId)
      : null;

  if (!safeQuestion) {
    console.warn("queryRAG called without a valid question");
    return "Please provide a valid question.";
  }
  console.log("safequestion",safeQuestion)

  let context = "";
  let sources = [];

  try {
    const embeddings = await buildEmbeddings();
    const pineconeIndex = getPineconeIndex();
    const namespacedIndex = safeClerkId
      ? pineconeIndex.namespace(safeClerkId)
      : pineconeIndex;
    const queryVector = await embeddings.embedQuery(safeQuestion);

    const runQuery = (filterValue) =>
      namespacedIndex.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
        ...(filterValue !== undefined
          ? { filter: { documentId: filterValue } }
          : {}),
      });
      

    let result = await runQuery(safeDocumentId ?? undefined);

    if (
      (!Array.isArray(result?.matches) || result.matches.length === 0) &&
      numericDocumentId !== null &&
      safeDocumentId !== String(numericDocumentId)
    ) {
      console.log(`Retrying Pinecone query with numeric documentId=${numericDocumentId}`);
      result = await runQuery(numericDocumentId);
    }

    const matches = Array.isArray(result?.matches) ? result.matches : [];
    if (matches.length > 0) {
      console.log(
        `Pinecone retrieved ${matches.length} match(es); first metadata keys: ${Object.keys(matches[0]?.metadata || {}).join(", ")}`
      );
    }
    context = matches
      .map((match) => {
        const text = match?.metadata?.text;
        return typeof text === "string" ? text.trim() : "";
      })
      .filter(Boolean)
      .join("\n\n");

    sources = matches
      .map((match, index) => {
        const text = typeof match?.metadata?.text === "string"
          ? match.metadata.text.trim()
          : "";
        const page = match?.metadata?.loc?.pageNumber ?? match?.metadata?.pageNumber ?? null;
        const documentRef =
          match?.metadata?.source ||
          match?.metadata?.pdf?.source ||
          match?.metadata?.blobType ||
          "Uploaded PDF";

        return {
          id: `${match?.id || "match"}-${index}`,
          label: documentRef,
          page,
          snippet: text ? `${text.slice(0, 220)}${text.length > 220 ? "..." : ""}` : "",
          score: typeof match?.score === "number" ? match.score : null,
        };
      })
      .filter((source) => source.snippet);

    console.log(
      `Pinecone context ${context ? "found" : "empty"} for clerkId=${safeClerkId || "unknown"} documentId=${safeDocumentId || "all"}`
    );
  } catch (error) {
    console.error("Pinecone failed, using general AI");
    logErrorDetails("Pinecone query error:", error);
    context = "";
  }

  const prompt = [
    "You are an AI assistant.",
    "Use the provided context when it is relevant and available.",
    "If the context is empty or insufficient, answer using general knowledge.",
    "",
    "Context:",
    context || "No retrieved context available.",
    "",
    `Question: ${safeQuestion}`,
  ].join("\n");

  const candidateModels = getCandidateGeminiModels();
  const availableModels = await listAvailableGeminiModels();
  const modelsToTry = availableModels.length
    ? candidateModels.filter((model) => availableModels.includes(model))
    : candidateModels;

 

  if (!modelsToTry.length) {
    console.error("No compatible Gemini models available for generateContent");
    return FALLBACK_MESSAGE;
  }

  for (const [index, model] of modelsToTry.entries()) {
    try {
      if (index > 0) {
        console.warn(`Gemini fallback triggered: switching to ${model}`);
      }

    

      const chatModel = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY?.trim(),
        model,
        temperature: 0.3,
      });

      const response = await chatModel.invoke(prompt);
      const answer = normalizeResponseContent(response?.content);

      if (answer) {
        return { answer, sources };
      }

      throw new Error(`Gemini returned empty content for model ${model}`);
    } catch (error) {
      logErrorDetails(`Gemini model failed: ${model}`, error);

      if (index === modelsToTry.length - 1) {
        return { answer: FALLBACK_MESSAGE, sources: [] };
      }
    }
  }

  return { answer: FALLBACK_MESSAGE, sources: [] };
};

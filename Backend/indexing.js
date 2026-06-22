import * as dotenv from "dotenv";
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

const DIMENSION = 768;

/* ---------- Build Embeddings ---------- */
export async function buildEmbeddings() {
  const googleApiKey = process.env.GOOGLE_API_KEY?.trim();

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: googleApiKey,
    model: "gemini-embedding-001",
  });

  const origDocs = embeddings.embedDocuments.bind(embeddings);
  embeddings.embedDocuments = async (texts) => {
    const vecs = await origDocs(texts);
    return vecs.map((v) => v.slice(0, DIMENSION));
  };

  const origQuery = embeddings.embedQuery.bind(embeddings);
  embeddings.embedQuery = async (text) => {
    const vector = await origQuery(text);
    return vector.slice(0, DIMENSION);
  };

  return embeddings;
}

/* ---------- Get Pinecone Index ---------- */
export function getPineconeIndex() {
  const pineconeApiKey = process.env.PINECONE_API_KEY?.trim();
  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
  });

  const indexName = process.env.PINECONE_INDEX_NAME?.trim();
  const rawIndexHost = process.env.PINECONE_INDEX_HOST?.trim();
  const indexHost = rawIndexHost
    ? rawIndexHost.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    : undefined;

  if (!pineconeApiKey) {
    throw new Error(
      "Missing Pinecone configuration: set PINECONE_API_KEY in your environment."
    );
  }

  if (!indexName) {
    throw new Error(
      "Missing Pinecone index configuration: set PINECONE_INDEX_NAME in your environment."
    );
  }

  if (rawIndexHost && rawIndexHost !== indexHost) {
    console.warn("Normalized Pinecone host by removing protocol/trailing slash");
  }

  return indexHost ? pinecone.index(indexName, indexHost) : pinecone.index(indexName);
}

/* ---------- INDEX PDF FUNCTION ---------- */
export async function indexPDF(pdfPath, clerkId, documentId) {
  try {
    const embeddings = await buildEmbeddings();
    const pineconeIndex = getPineconeIndex();

    console.log("Loading PDF...");

    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(docs);
    console.log("Chunks created:", chunks.length);

    const docsWithMetadata = chunks.map((chunk, index) => ({
      pageContent: chunk.pageContent,
      metadata: {
        ...chunk.metadata,
        documentId: String(documentId),
        chunkIndex: index,
      },
    }));

    await PineconeStore.fromDocuments(docsWithMetadata, embeddings, {
      pineconeIndex,
      namespace: clerkId,
      maxConcurrency: 5,
    });

    console.log("PDF indexed successfully");
    return { success: true };
  } catch (error) {
    console.error("Indexing Error:", error);
    throw error;
  }
}

import * as dotenv from "dotenv";
dotenv.config();
import pool from "./db.js"

import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { queryRAG } from "./Services/ragservices.js";

const DIMENSION = 768;

/* ---------- Build Embeddings (SAME AS BEFORE) ---------- */
async function buildEmbeddings() {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
  });

  const origDocs = embeddings.embedDocuments.bind(embeddings);
  embeddings.embedDocuments = async (texts) => {
    const vecs = await origDocs(texts);
    return vecs.map((v) => v.slice(0, DIMENSION));
  };

  const origQuery = embeddings.embedQuery.bind(embeddings);
  embeddings.embedQuery = async (t) => {
    const v = await origQuery(t);
    return v.slice(0, DIMENSION);
  };

  return embeddings;
}

/* ---------- Ask Question Function ---------- */
export const askQuestion = async (req, res) => {
  try {
    console.log("reached in ask question")
   const { question, documentId } = req.body;
    const clerkId = req.auth.userId;

    //  Get user from DB
    const userRes = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].id;
    console.log("USer id:")

    //  Get AI answer
    const ragResult = await queryRAG(question, clerkId, documentId);
    const answer = ragResult?.answer || "No response";
    const sources = Array.isArray(ragResult?.sources) ? ragResult.sources : [];

    //  Save USER message
    await pool.query(
  `INSERT INTO chats (user_id, message, role, document_id)
   VALUES ($1, $2, $3, $4)`,
  [userId, question, "user", documentId]
);

    //  Save AI response
 await pool.query(
  `INSERT INTO chats (user_id, message, role, document_id)
   VALUES ($1, $2, $3, $4)`,
  [userId, answer, "ai", documentId]
);

    //  Send response
    res.json({ answer, sources });

  } catch (error) {
    console.error("Query Controller Error:", error);
    res.status(500).json({ error: "Query failed" });
  }
};

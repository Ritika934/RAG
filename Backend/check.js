import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

await pc.deleteIndex(process.env.PINECONE_INDEX_NAME);

console.log("Index deleted");

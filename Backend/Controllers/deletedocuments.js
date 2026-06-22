import pool from "../db.js";
import { getPineconeIndex } from "../indexing.js";

const deleteDocument = async (req, res) => {
  try {

console.log("reached in delete document");

    const clerkId = req.auth.userId;
    const { documentId } = req.params;

    const userRes = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].id;

    await pool.query(
      "DELETE FROM chats WHERE user_id = $1 AND document_id = $2",
      [userId, documentId]
    );

    try {
      const pineconeIndex = getPineconeIndex();
      const namespacedIndex = clerkId
        ? pineconeIndex.namespace(clerkId)
        : pineconeIndex;

      await namespacedIndex.deleteMany({
        documentId: String(documentId),
      });

      console.log("Pinecone vectors deleted");
    } catch (err) {
      console.log("Pinecone delete failed (safe to ignore)", err.message);
    }

    await pool.query(
      "DELETE FROM documents WHERE id = $1 AND user_id = $2",
      [documentId, userId]
    );

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

export default deleteDocument;

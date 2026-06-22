import pool from "../db.js";

const getChats = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { documentId } = req.query; // ✅ GET FROM FRONTEND

    // 1️⃣ Get user ID
    const userRes = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].id;

    // 2️⃣ Fetch chats (FILTERED BY DOCUMENT)
    const chats = await pool.query(
      `SELECT * FROM chats 
       WHERE user_id = $1 AND document_id = $2
       ORDER BY created_at ASC`,
      [userId, documentId]
    );

    res.json(chats.rows);

  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export default getChats;
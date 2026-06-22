import pool from "../db.js";

const searchChats = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const { query } = req.query; // Search keyword/topic

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    // 1️⃣ Get user ID
    const userRes = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].id;

    // 2️⃣ Search chats using ILIKE (case-insensitive) for keyword matching
    const searchResults = await pool.query(
      `SELECT * FROM chats 
       WHERE user_id = $1 AND message ILIKE $2
       ORDER BY created_at DESC`,
      [userId, `%${query}%`]
    );

    res.json(searchResults.rows);

  } catch (error) {
    console.error("Search chats error:", error);
    res.status(500).json({ error: "Failed to search chats" });
  }
};

export default searchChats;

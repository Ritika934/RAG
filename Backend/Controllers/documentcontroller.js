import pool from "../db.js";
 const getUserDocuments = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    // Get user id
    const userRes = await pool.query(
      "SELECT id FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userRes.rows[0].id;

    // Get documents
    const docs = await pool.query(
      "SELECT id, title, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(docs.rows);

  } catch (error) {
    console.error("Get Documents Error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};
export default getUserDocuments;
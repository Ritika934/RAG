import pool from "../db.js"
const syncUser = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    // 🔥 get email from Clerk
    const email = req.auth.sessionClaims?.email || null;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    let user;

    if (existingUser.rows.length === 0) {
      const newUser = await pool.query(
        "INSERT INTO users (clerk_id, email) VALUES ($1, $2) RETURNING *",
        [clerkId, email]
      );
      user = newUser.rows[0];
    } else {
      user = existingUser.rows[0];
    }

    res.json({
      message: "User synced successfully",
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};
export default syncUser;
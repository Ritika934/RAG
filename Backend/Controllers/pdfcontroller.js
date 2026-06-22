import pool from "../db.js";
import { indexPDF } from "../indexing.js";

export const uploadPDF = async (req, res) => {
  try {
    console.log("UPLOAD API HIT ");

    const clerkId = req.auth.userId;

    
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = file.path;
    const fileName = file.originalname;

    console.log("File:", fileName);

    //  Get user from DB
    const userResult = await pool.query(
      "SELECT * FROM users WHERE clerk_id = $1",
      [clerkId]
    );

    const user = userResult.rows[0];

    //  Insert document in DB
  

const docResult = await pool.query(
  `INSERT INTO documents (user_id, title, pinecone_namespace)
   VALUES ($1, $2, $3)
   RETURNING *`,
  [user.id, fileName, clerkId]
);




    const document = docResult.rows[0];

    //  Call indexing function (IMPORTANT CHANGE)
    await indexPDF(filePath, clerkId, document.id);

    res.json({
      message: "PDF uploaded and indexed successfully",
      document,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
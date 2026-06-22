import express from "express";
import multer from "multer";
import { uploadPDF } from "../Controllers/pdfcontroller.js";
import { askQuestion } from "../query.js";
import requireAuth from "../middlewear/authmiddlewear.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// FIXED
router.post("/upload", requireAuth, upload.single("file"), uploadPDF);


router.post("/ask", requireAuth, askQuestion);

export default router;
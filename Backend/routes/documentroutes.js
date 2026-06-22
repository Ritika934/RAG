import express from "express";
import requireAuth from "../middlewear/authmiddlewear.js";
import  getUserDocuments  from "../Controllers/documentcontroller.js";
import deleteDocument from "../Controllers/deletedocuments.js";



const router = express.Router();

router.get("/", requireAuth, getUserDocuments);
router.delete("/:documentId", requireAuth,deleteDocument);

export default router;
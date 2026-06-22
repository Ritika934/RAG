import express from "express";
import requireAuth from "../middlewear/authmiddlewear.js";
import getChats from "../Controllers/getchats.js";
import searchChats from "../Controllers/searchchats.js";

const router = express.Router();

router.get("/", requireAuth, getChats);
router.get("/search", requireAuth, searchChats);

export default router;
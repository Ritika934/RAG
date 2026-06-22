import express from "express";
import requireAuth from "../middlewear/authmiddlewear.js";
import  syncUser  from "../Controllers/usercontroller.js";

const router = express.Router();

router.post("/sync", requireAuth, syncUser);

export default router;
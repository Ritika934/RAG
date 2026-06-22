import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import db from "./db.js"
import ragRoutes from "./routes/ragrouter.js";
import requireAuth from "./middlewear/authmiddlewear.js"
import userRoutes from "./routes/userroutes.js";
import chatroutes from "./routes/chatroutes.js"
import documentRoutes from "./routes/documentroutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server Running");
});
app.get("/auth", requireAuth, (req, res) => {
  res.json({
    message: "Backend authentication successful",
    clerkId: req.auth.userId,
  });
})


app.use("/api/users", userRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/chats", chatroutes);
app.use("/api/documents", documentRoutes);



app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
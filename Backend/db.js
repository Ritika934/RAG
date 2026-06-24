import {Pool} from "pg";
import dotenv from "dotenv"; 
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  //for the neon 
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected Successfully"))
  .catch((err) => console.error("Database Connection Error:", err));

export default pool;  
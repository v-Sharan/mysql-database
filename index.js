import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import mysql from "mysql2/promise";

import Router from "./routes/products.js";

config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("HI");
});

app.use("/books", Router);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong.";
  res.status(status).json({ message: message });
});

const db = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

const StartServer = async () => {
  try {
    await db.connect();
    app.listen(8000, () => {
      console.log(`http://localhost:8000`);
    });
  } catch (err) {
    console.log(err);
  }
};

StartServer();

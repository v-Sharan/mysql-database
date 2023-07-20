import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import Router from "./routes/products.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("HI");
});

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong.";
  res.status(status).json({ message: message });
});

app.use("/books", Router);

app.listen(8000, () => {
  console.log(`http://localhost:8000`);
});

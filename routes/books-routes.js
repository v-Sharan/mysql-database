import { Router } from "express";
import { check } from "express-validator";

import {
  getAllData,
  BuyBooks,
  getSoldBooks,
  getSoldBookById,
} from "../controllers/books-controller.js";

const route = Router();

route.get("/", getAllData);

route.post(
  "/",
  [check("bookid").notEmpty(), check("quantity").notEmpty()],
  BuyBooks
);

route.get("/sold", getSoldBooks);

route.get("/sold/:bookid", getSoldBookById);

export default route;

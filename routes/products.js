import { Router } from "express";
import { query } from "../lib/query.js";
import { check, validationResult } from "express-validator";
import { HttpError } from "../utils/HttpError.js";

const route = Router();

route.get("/", async (req, res) => {
  const data = await query({ query: "SELECT * FROM BOOKS" });
  res.json(data);
});

route.post(
  "/",
  [
    check("bookid").notEmpty(),
    check("book_name").notEmpty(),
    check("quantity").notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }
    const { bookid, book_name, quantity } = req.body;
    try {
      const data = await query({
        query: `SELECT availability FROM BOOKS WHERE BOOKID=${bookid}`,
      });

      if (data[0].availability <= 0) {
        return next(new HttpError("Insufficient books,may try later", 401));
      }

      await query({
        query:
          "INSERT INTO sold_books (bookid,book_name,quantity) VALUES (?,?,?)",
        values: [bookid, book_name, quantity],
      });

      await query({
        query: "UPDATE BOOKS SET availability=? WHERE bookid=?",
        values: [data[0].availability - quantity, bookid],
      });

      res.json({ message: "Updated" });
    } catch (error) {
      console.log(error);
    }
  }
);

route.get("/sold", async (req, res) => {
  const data = await query({
    query:
      "SELECT BOOKS.BOOKID,BOOKS.BOOK_NAME,BOOKS.AVAILABILITY,SOLD_BOOKS.QUANTITY,SOLD_BOOKS.TIME FROM BOOKS INNER JOIN SOLD_BOOKS ON BOOKS.BOOKID=SOLD_BOOKS.BOOKID",
  });
  res.json(data);
});

route.get("/sold/:bookid", async (req, res) => {
  const { bookid } = req.params;
  const data = await query({
    query:
      "SELECT BOOKS.BOOKID,BOOKS.BOOK_NAME,BOOKS.AVAILABILITY,SOLD_BOOKS.QUANTITY,SOLD_BOOKS.TIME FROM BOOKS INNER JOIN SOLD_BOOKS ON BOOKS.BOOKID=SOLD_BOOKS.BOOKID",
  });

  const byBooid = data.filter((book) => book.BOOKID == bookid);
  res.json(byBooid);
});

export default route;

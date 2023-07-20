import { Router } from "express";
import { query } from "../lib/query.js";
import { check, validationResult } from "express-validator";
import { HttpError } from "../utils/HttpError.js";

const route = Router();

route.get("/", async (req, res, next) => {
  const data = await query({ query: "SELECT * FROM books" });
  res.json({ message: data });
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
        query: `SELECT availability FROM books WHERE BOOKID=${bookid}`,
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
        query: "UPDATE books SET availability=? WHERE bookid=?",
        values: [data[0].availability - quantity, bookid],
      });

      res.json({ message: "Updated" });
    } catch (error) {
      console.log(error);
    }
  }
);

route.get("/sold", async (req, res, next) => {
  const data = await query({
    query:
      "SELECT books.BOOKID,books.BOOK_NAME,books.AVAILABILITY,sold_books.QUANTITY,sold_books.TIME FROM books INNER JOIN sold_books ON books.BOOKID=sold_books.BOOKID",
  });
  if (data.length === 0) {
    return next(new HttpError("No books sold", 401));
  }
  res.json({ message: data });
});

route.get("/sold/:bookid", async (req, res, next) => {
  const { bookid } = req.params;
  const data = await query({
    query:
      "SELECT books.BOOKID,books.BOOK_NAME,books.AVAILABILITY,sold_books.QUANTITY,sold_books.TIME FROM books INNER JOIN sold_books ON books.BOOKID=sold_books.BOOKID",
  });

  const byBookid = data.filter((book) => book.BOOKID == bookid);
  if (byBookid.length === 0) {
    return next(new HttpError("No Books sold", 401));
  }
  res.json({ message: byBookid });
});

export default route;

import { query } from "../lib/query.js";
import { validationResult } from "express-validator";
import { HttpError } from "../utils/HttpError.js";

export const getAllData = async (req, res, next) => {
  const data = await query({ query: "SELECT * FROM books" });
  res.json({ message: data });
};

export const BuyBooks = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { bookid, quantity } = req.body;
  const data = await query({
    query: `SELECT availability FROM books WHERE bookid=${bookid}`,
  });

  if (data[0].availability <= 0) {
    return next(new HttpError("Insufficient books,may try later", 401));
  }

  await query({
    query: "INSERT INTO sold_books (bookid,quantity) VALUES (?,?)",
    values: [bookid, quantity],
  });

  await query({
    query: "UPDATE books SET availability=? WHERE bookid=?",
    values: [data[0].availability - quantity, bookid],
  });

  res.json({ message: "Updated" });
};

export const getSoldBooks = async (req, res, next) => {
  const data = await query({
    query:
      "SELECT books.bookid,books.book_name,books.availability,sold_books.quantity,sold_books.time FROM books INNER JOIN sold_books ON books.bookid=sold_books.bookid",
  });
  if (data.length === 0) {
    return next(new HttpError("No books sold", 401));
  }
  res.json({ message: data });
};

export const getSoldBookById = async (req, res, next) => {
  const { bookid } = req.params;
  const data = await query({
    query:
      "SELECT books.bookid,books.book_name,books.availability,sold_books.quantity,sold_books.time FROM books INNER JOIN sold_books ON books.bookid=sold_books.bookid",
  });

  const bybookid = data.filter((book) => book.bookid == bookid);
  if (bybookid.length === 0) {
    return next(new HttpError("No Books sold", 401));
  }
  res.json({ message: bybookid });
};

import mysql from "mysql2/promise";
import { config } from "dotenv";

config();

export async function query({ query, values = [] }) {
  const db = await mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });
  try {
    const [results] = await db.execute(query, values);
    db.end();
    return results;
  } catch (error) {
    return { message: error.message };
  }
}

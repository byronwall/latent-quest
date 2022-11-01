import { db_getAllSubChoices } from "../../../libs/db";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const result = await db_getAllSubChoices();

  // iterate

  res.status(200).json({ choices: result });
}

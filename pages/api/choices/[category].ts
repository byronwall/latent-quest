import {
  db_getAllSubChoices,
  db_getAllSubChoicesCategory,
} from "../../../libs/db/choices";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const category = req.query.category as string;

  const result =
    category === ""
      ? await db_getAllSubChoices
      : await db_getAllSubChoicesCategory(category);

  // iterate

  res.status(200).json({ choices: result });
}

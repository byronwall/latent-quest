import { commonChoices } from "../../../components/common_choices";
import { db_insertSubChoice } from "../../../libs/db";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const data = commonChoices;

  const result = await db_insertSubChoice(data);

  // iterate

  res.status(200).json({ result });
}

import { db_getAllSubChoices, supabase } from "../../../libs/db";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const result = await (await supabase.rpc("choices_categories")).data;
  // iterate

  res.status(200).json({ choices: result });
}

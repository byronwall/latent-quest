import { supabase } from "../../../libs/db/supabase";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  // TODO this should have a proper method in the db lib
  const result = await (await supabase.rpc("choices_categories")).data;
  // iterate

  res.status(200).json({ choices: result });
}

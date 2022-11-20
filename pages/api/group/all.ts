import { supabase } from "../../../libs/db/supabase";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const result = await supabase
    .from("groups")
    .select("id, view_settings, images(id, url)")
    .order("created_at", { ascending: false });
  // .limit(1, { foreignTable: "images" });

  // iterate

  res.status(200).json(result.data);
}

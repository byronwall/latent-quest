import { createPngGridFromUrls } from "./createPngGridFromUrls";

import { supabase } from "../../../../libs/db/supabase";

import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const { groupId } = req.query;

  // need to generate an image and then stream out

  // get image urls based on group id

  const dbData = await supabase
    .from("images")
    .select("url")
    .order("dateCreated", { ascending: false })
    .eq("groupId", groupId)
    .limit(4);

  if (!dbData.data) {
    throw new Error("no data");
  }

  const urls = dbData.data.map((image) => image.url);

  const data = await createPngGridFromUrls(urls);

  res.setHeader("Content-Type", "image/png");
  res.send(data);
};

export default handler;

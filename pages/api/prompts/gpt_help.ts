import { generatePromptHelper } from "../../../libs/openai";

import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const { topic, artistOrStart } = req.body;

  console.log("topic", topic);

  const result = await generatePromptHelper(topic, artistOrStart);

  // cache for a day
  // res.setHeader("Cache-Control", "maxage=86400, s-maxage=86400");
  res.status(200).send(result);
};

export default handler;

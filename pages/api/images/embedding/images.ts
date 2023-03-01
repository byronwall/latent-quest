import { UMAP } from "umap-js";

import { db_getAllEmbeddedImages } from "../../../../libs/db/images";

import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const { groupId } = req.body;

  const images = await db_getAllEmbeddedImages(groupId);

  // get groupId from post body param

  console.log("start computing UMAP embedding", images.length, groupId);

  const umap = new UMAP();

  const rawImageEmbedding = images.map((c) => c.embedding ?? []);

  // array of [x , y] pairs
  const embedding = umap.fit(rawImageEmbedding);

  embedding.forEach((c, i) => {
    images[i].embedding = c;
  });

  console.log("done computing UMAP embedding");

  res.send(images);
};

export default handler;

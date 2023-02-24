import { UMAP } from "umap-js";

import { db_getAllEmbeddedImages } from "../../../../libs/db/images";

export default async function handler(req, res) {
  const images = await db_getAllEmbeddedImages();

  console.log("start computing UMAP embedding");

  const umap = new UMAP();

  const rawImageEmbedding = images.map((c) => c.embedding ?? []);

  // array of [x , y] pairs
  const embedding = umap.fit(rawImageEmbedding);

  embedding.forEach((c, i) => {
    images[i].embedding = c;
  });

  console.log("done computing UMAP embedding");

  res.send(images);
}

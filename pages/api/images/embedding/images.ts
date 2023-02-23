import { db_getAllEmbeddedImages } from "../../../../libs/db/images";

export default async function handler(req, res) {
  const images = await db_getAllEmbeddedImages();

  console.log("images", images);

  res.send(images);
}

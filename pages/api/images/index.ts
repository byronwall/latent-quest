import { db_getAllImages } from "../../../libs/db";

export default async function handler(req, res) {
  const images = await db_getAllImages();

  console.log("images found: ", images.length);

  res.send(images);
}

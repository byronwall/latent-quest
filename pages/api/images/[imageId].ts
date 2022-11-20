import { db_getSingleImages } from "../../../libs/db/images";

export default async function handler(req, res) {
  const { imageId } = req.query;

  const images = await db_getSingleImages(imageId);

  res.send(images);
}

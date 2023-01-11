import { db_deleteImage, db_getAllImages } from "../../../libs/db/images";

import type { SdImage } from "../../../libs/shared-types/src";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const image = req.body as SdImage;
    // delete the image
    await db_deleteImage(image.id);
    res.status(200).json({ status: "ok" });
    return;
  }

  const images = await db_getAllImages();

  console.log("images found: ", images.length);

  res.send(images);
}

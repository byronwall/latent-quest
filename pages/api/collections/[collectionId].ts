import {
  db_addImageToCollection,
  db_getCollection,
  db_removeImageFromCollection,
} from "../../../libs/db/collections";

import type { NextApiHandler } from "next";

interface ReqQuery {
  collectionId: string;
}

export interface ImageToCollectionBody {
  imageIds: string[];
}

const handler: NextApiHandler = async (req, res) => {
  const { collectionId } = req.query as unknown as ReqQuery;

  if (req.method === "PUT") {
    // this is used to add a link between the images and collection
    const { imageIds } = req.body as unknown as ImageToCollectionBody;

    await db_addImageToCollection(collectionId, imageIds);
    res.status(200).json({ status: "ok" });
    return;
  }

  // mirror for delete
  if (req.method === "DELETE") {
    // this is used to remove a link between the images and collection
    const { imageIds } = req.body as unknown as ImageToCollectionBody;

    await db_removeImageFromCollection(collectionId, imageIds);
    res.status(200).json({ status: "ok" });
    return;
  }

  const collection = await db_getCollection(collectionId);
  res.status(200).json(collection);
};

export default handler;

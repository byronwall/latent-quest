import {
  db_deleteCollection,
  db_getAllCollections,
  db_upsertCollection,
} from "../../../libs/db/collections";

import type { LqDbCollection } from "../../../model/collections";

export default async function handler(req, res) {
  const lqCollection = req.body as LqDbCollection;

  console.log("req.body", req.body);

  if (req.method === "PUT") {
    await db_upsertCollection(lqCollection);
    res.status(200).json({ status: "ok" });
    return;
  }

  if (req.method === "DELETE") {
    if (!lqCollection.id) {
      res.status(400).json({ status: "error", message: "id is required" });
      return;
    }
    await db_deleteCollection(lqCollection.id);
    res.status(200).json({ status: "ok" });
    return;
  }

  // return list of collections
  const collections = await db_getAllCollections();
  res.status(200).json(collections);
}

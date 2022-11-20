import { db_insertSubChoice } from "../../../libs/db/choices";

import type { SdSubChoice } from "../../../libs/shared-types/src";

// next.js api handler
export default async function handler(req, res) {
  // load choices from json file

  const data = req.body as SdSubChoice[];

  const result = await db_insertSubChoice(data);

  res.status(200).json({ result });
}

import { db_upsertStudy } from "../../../libs/db/studies";

import type { SdImageStudyDef } from "../../../libs/shared-types/src";

export default async function handler(req, res) {
  if (req.method === "PUT" || req.method === "POST") {
    // update the group with the body data

    // get group from body
    const studyData = req.body as SdImageStudyDef;

    const data = await db_upsertStudy(studyData);
    res.status(200).json(data);
    return;
  }

  res.status(500);
}

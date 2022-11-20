// next js handler to return study for studyId

import { db_getStudyForId } from "../../../libs/db/studies";

export default async function handler(req, res) {
  const { studyId } = req.query;

  const study = await db_getStudyForId(studyId);

  res.status(200).json(study);
}

// next js handler to return all studies for given groupId

import { db_getStudiesForGroupId } from "../../../../libs/db/studies";

export default async function handler(req, res) {
  const { groupId } = req.query;

  const studies = await db_getStudiesForGroupId(groupId);

  console.log("studies=", { groupId, studies });

  res.status(200).json(studies);
}

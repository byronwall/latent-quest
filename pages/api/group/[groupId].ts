import { db_getGroup, db_updateGroup } from "../../../libs/db";

// next.js api handler
export default async function handler(req, res) {
  const { groupId } = req.query;

  // if we have a body, this is an update

  if (req.method === "PUT") {
    // update the group with the body data

    // get group from body
    const groupData = req.body;

    await db_updateGroup(groupData);
    res.status(200).json({ status: "ok" });
    return;
  }

  console.log("groupId", groupId);
  const groupDetails = await db_getGroup(groupId);
  res.status(200).json(groupDetails);
}

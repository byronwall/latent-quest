import {
  db_updateGroup,
  db_deleteImageGroup,
  db_getGroup,
} from "../../../libs/db/groups";

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

  // handle delete
  if (req.method === "DELETE") {
    // delete the group
    await db_deleteImageGroup(groupId);
    res.status(200).json({ status: "ok" });
    return;
  }

  console.log("groupId", groupId);
  const groupDetails = await db_getGroup(groupId);
  res.status(200).json(groupDetails);
}

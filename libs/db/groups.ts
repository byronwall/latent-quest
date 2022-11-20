import { convertSqliteToObj } from "./images";
import { supabase } from "./supabase";

import type { SdImageSqlite } from "./images";
import type { SdImage, SdImageGroup } from "../shared-types/src";

type SdImageGroupInsert = Omit<SdImageGroup, "created_at">;

export async function db_deleteImageGroup(groupId: string) {
  // delete from images
  const { data, error } = await supabase
    .from("images")
    .delete()
    .match({ groupId });

  // delete from image_groups
  const { data: data2, error: error2 } = await supabase
    .from("groups")
    .delete()
    .match({ id: groupId });

  if (error || error2) {
    console.error("Error deleting images from database", error);
    return false;
  }

  console.log("deleted", groupId, data, data2);

  return true;
}

export async function db_getImagesFromGroup(groupId: string) {
  // load all from supabase with group id
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("groupId", groupId);

  if (error) {
    console.error("Error loading images from database", error);
    return [];
  }

  (data as SdImageSqlite[]).forEach(convertSqliteToObj);
  return data as SdImage[];
}

export async function db_getGroup(id: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading group from database", error);
    return undefined;
  }

  console.log("group data", data);

  return data as SdImageGroup;
}

export async function db_insertGroup(group: SdImageGroupInsert) {
  const { data, error } = await supabase.from("groups").insert(group);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data;
}

export async function db_updateGroup(group: SdImageGroup) {
  const { data, error } = await supabase
    .from("groups")
    .update(group)
    .eq("id", group.id);

  if (error) {
    console.error("Error updating group in database", error);
    return undefined;
  }

  return data;
}

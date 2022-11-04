// file will communicate with the sqlite database
import { createClient } from "@supabase/supabase-js";

import { SdImage, SdImageGroup, SdSubChoice } from "./shared-types/src";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_KEY ?? "";
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function db_getAllImages() {
  // load all from supabase
  const { data, error } = await supabase.from("images").select("*");

  if (error) {
    console.error("Error loading images from database", error);
    return [];
  }

  (data as SdImageSqlite[]).forEach(convertSqliteToObj);

  return data as SdImage[];
}

// function to delete a group id from both tables

export async function db_deleteImageGroup(groupId: string) {
  // delete from images
  const { data, error } = await supabase
    .from("images")
    .delete()
    .match({ groupId });

  // delete from image_groups
  const { data: data2, error: error2 } = await supabase
    .from("image_groups")
    .delete()
    .match({ id: groupId });

  if (error || error2) {
    console.error("Error deleting images from database", error);
    return false;
  }

  return true;
}

export async function db_getSingleImages(id: string) {
  // load single from supabase using id
  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error loading group from database", error);
    return undefined;
  }

  convertSqliteToObj(data as SdImageSqlite);
  return data;
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

type SdImageSqlite = Omit<SdImage, "promptBreakdown"> & {
  promptBreakdown: string;
};

function convertSqliteToObj(sqliteObj: SdImageSqlite) {
  sqliteObj.promptBreakdown = JSON.parse(sqliteObj.promptBreakdown);

  const sqliteObjObj = sqliteObj as unknown as SdImage;

  // migrate that prompt to the new format
  sqliteObjObj.promptBreakdown.parts.forEach((part) => {
    part.label = "unknown";
  });
}

export async function db_insertImage(image: SdImage) {
  // insert into supabase

  (image as unknown as SdImageSqlite).promptBreakdown = JSON.stringify(
    image.promptBreakdown
  );

  const { data, error } = await supabase.from("images").insert(image);

  if (error) {
    console.error("Error inserting image into database", error);
    return undefined;
  }

  return data;
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

// insert group and catch errors

type SdImageGroupInsert = Omit<SdImageGroup, "created_at">;

export async function db_insertGroup(group: SdImageGroupInsert) {
  const { data, error } = await supabase.from("groups").insert(group);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data;
}

// method to update group

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

export async function db_insertSubChoice(choice: SdSubChoice | SdSubChoice[]) {
  const { data, error } = await supabase.from("choices").insert(choice);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data;
}

export async function db_getAllSubChoices() {
  const { data, error } = await supabase.from("choices").select("*");

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data as SdSubChoice[];
}

export async function db_getAllSubChoicesCategory(category: string) {
  const { data, error } = await supabase
    .from("choices")
    .select("*")
    .eq("category", category);

  if (error) {
    console.error("Error inserting group into database", error);
    return undefined;
  }

  return data as SdSubChoice[];
}

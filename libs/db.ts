// file will communicate with the sqlite database

import { createClient } from "@supabase/supabase-js";
import { SdImage } from "./shared-types/src";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("supabase", supabase);

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

import { supabase } from "./supabase";

import type { SdImage } from "../shared-types/src";

export type SdImageSqlite = Omit<SdImage, "promptBreakdown"> & {
  promptBreakdown: string;
};

// function to update single image by id
export async function db_updateImageEmbedding(
  imageId: string,
  embedding: number[]
) {
  // update in supabase
  const { error } = await supabase
    .from("images")
    .update({ embedding: embedding })
    .eq("id", imageId);

  if (error) {
    console.error("Error updating image embedding in database", error);
    return false;
  }

  return true;
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

export async function db_deleteImage(id: string) {
  // delete from supabase
  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    console.error("Error deleting image from database", error);
    return false;
  }

  return true;
}

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
  return data as SdImage;
}

export function convertSqliteToObj(sqliteObj: SdImageSqlite) {
  sqliteObj.promptBreakdown = JSON.parse(sqliteObj.promptBreakdown);

  const sqliteObjObj = sqliteObj as unknown as SdImage;

  // migrate that prompt to the new format
  sqliteObjObj.promptBreakdown.parts.forEach((part) => {
    part.label = "unknown";
  });
}

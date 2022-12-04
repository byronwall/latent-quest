import { supabase } from "./supabase";

import { getUuid } from "../shared-types/src";

import type { LqCollection, LqDbCollection } from "../../model/collections";

export async function db_upsertCollection(collection: LqDbCollection) {
  // ensure the id is added if not present
  if ("id" in collection === false || collection.id === undefined) {
    collection.id = getUuid();
  }

  const { data, error } = await supabase.from("collections").upsert(collection);

  if (error) {
    throw error;
  }

  return data;
}

export async function db_getCollection(collectionId: string) {
  // the images(*) relies on a composite primary key
  const { data, error } = await supabase
    .from("collections")
    .select("*, images(*)")
    .eq("id", collectionId)
    .single();

  if (error) {
    throw error;
  }

  const result = data as LqCollection;

  // need to parse the JSONB fields since they're returned as strings
  result.images.forEach((image) => {
    if (typeof image.promptBreakdown === "string") {
      image.promptBreakdown = JSON.parse(image.promptBreakdown);
    }
  });

  return result;
}

export async function db_deleteCollection(collectionId: string) {
  const { data, error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId);

  if (error) {
    throw error;
  }

  return data;
}

export async function db_addImageToCollection(
  collectionId: string,
  sdImageId: string | string[]
) {
  // force to array
  const imageIds = Array.isArray(sdImageId) ? sdImageId : [sdImageId];

  const entries = imageIds.map((imageId) => ({
    collectionId,
    imageId,
  }));

  const { data, error } = await supabase
    .from("collection_images")
    .insert(entries);

  if (error) {
    throw error;
  }

  return data;
}

export async function db_removeImageFromCollection(
  collectionId: string,
  sdImageId: string | string[]
) {
  const imageIds = Array.isArray(sdImageId) ? sdImageId : [sdImageId];

  const { data, error } = await supabase
    .from("collection_images")
    .delete()
    .eq("collectionId", collectionId)
    .in("imageId", imageIds);

  if (error) {
    throw error;
  }

  return data;
}

export async function db_getAllCollections() {
  const { data, error } = await supabase.from("collections").select("*");

  if (error) {
    throw error;
  }

  return data;
}

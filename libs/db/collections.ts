import { supabase } from "./supabase";

import { getUuid } from "../shared-types/src";

import type { SdImage } from "../shared-types/src";
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
  // this uses the join table and rebuilds the object later
  const { data, error } = await supabase
    .from("collection_images")
    .select("images(*), collections(*)")
    .eq("collectionId", collectionId);

  if (error) {
    throw error;
  }

  type result = {
    images: SdImage;
    collections: LqDbCollection;
  };

  const _result = data as result[];

  if (_result.length === 0) {
    return [];
  }

  const result: LqCollection = {
    ..._result[0].collections,
    images: _result.map((r) => r.images),
  };

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
    id: getUuid(),
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

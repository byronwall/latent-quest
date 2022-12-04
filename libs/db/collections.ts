import { supabase } from "./supabase";

import { getUuid } from "../shared-types/src";

import type { LqDbCollection } from "../../model/collections";

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
  // this also needs to grab the images and build the full object
  // or build a view in the db that does this

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single();

  if (error) {
    throw error;
  }

  return data;
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
  sdImageId: string
) {
  const { data, error } = await supabase
    .from("collection_images")
    .insert({ collectionId, sdImageId });

  if (error) {
    throw error;
  }

  return data;
}

export async function db_removeImageFromCollection(
  collectionId: string,
  sdImageId: string
) {
  const { data, error } = await supabase
    .from("collection_images")
    .delete()
    .eq("collectionId", collectionId)
    .eq("sdImageId", sdImageId);

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

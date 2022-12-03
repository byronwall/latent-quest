// - New APIs to manage the CRUD operations
// - Create collection and save to supabase

import { supabase } from "./supabase";

import type { LqDbCollection } from "../../model/collections";

export async function db_upsertCollection(collection: LqDbCollection) {
  const { data, error } = await supabase.from("collections").upsert(collection);

  if (error) {
    throw error;
  }

  return data;
}

// - Get collection info (including images)

export async function db_getCollection(collectionId: string) {
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

// - Delete collection

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

// - Add images to collection

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

// - Remove images from collection

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

// - Get all collections

export async function db_getAllCollections() {
  const { data, error } = await supabase.from("collections").select("*");

  if (error) {
    throw error;
  }

  return data;
}

import { useQuery } from "react-query";

import { simpleDelete, simpleGet, simplePut } from "./api";

import type { ImageToCollectionBody } from "../pages/api/collections/[collectionId]";
import type {
  LqCollection,
  LqDbCollection,
  LqDbCollectionInput,
} from "./collections";

export const api_createCollection = simplePut<LqDbCollectionInput, any>(
  "/api/collections"
);

export const api_deleteCollection = simpleDelete<LqDbCollection, any>(
  "/api/collections"
);

export const api_addImageToCollection = (id: string, imageIds: string[]) => {
  return simplePut<ImageToCollectionBody>("/api/collections/" + id)({
    imageIds,
  });
};

export const api_removeImageFromCollection =
  simpleDelete<ImageToCollectionBody>("/api/collections/[collectionId]");

export const api_getAllCollections =
  simpleGet<LqDbCollection[]>("/api/collections");

export const api_getSingleCollection = (id: string) => {
  // this needs to be called to get data
  // TODO: better way?
  return simpleGet<LqCollection>(`/api/collections/${id}`)();
};

export function useGetCollections(initialData: LqDbCollection[] = []) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["collections"],
    queryFn: queryFnGetCollections,
    initialData,
  });

  if (data === undefined) {
    throw new Error("Collections not found");
  }

  return { collections: data };
}

export async function queryFnGetCollections({
  queryKey,
}: {
  queryKey?: any[];
}) {
  const allCollections = await api_getAllCollections();

  return allCollections;
}

// create hook and query function for getting a single collection

export function useGetSingleCollection(id: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["collection", id],
    queryFn: (params) => queryFnGetSingleCollection(params),
    initialData: undefined,
  });

  return { collection: data, isLoading, isError, error };
}

export async function queryFnGetSingleCollection({
  queryKey,
}: {
  queryKey: string[];
}) {
  const [key, id] = queryKey;

  if (key !== "collection") {
    throw new Error("Invalid query key");
  }

  const collection = await api_getSingleCollection(id);

  return collection;
}

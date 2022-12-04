import { useQuery } from "react-query";

import { simpleDelete, simpleGet, simplePut } from "./api";

import type { LqDbCollection } from "./collections";

export const api_createCollection = simplePut<LqDbCollection, any>(
  "/api/collections"
);

export const api_deleteCollection = simpleDelete<LqDbCollection, any>(
  "/api/collections"
);

export const api_getAllCollections =
  simpleGet<LqDbCollection[]>("/api/collections");

export function useGetCollections(initialData?: LqDbCollection[]) {
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

import { useQuery } from "react-query";

import type { AllGroupResponse } from "./ImageList";

export function useGetAllGroups(initialData?: AllGroupResponse[]) {
  const { data } = useQuery({
    queryKey: "groups",
    queryFn: queryFnGetAllGroups,
    initialData,
  });

  return { groupList: data ?? [] };
}
export async function queryFnGetAllGroups() {
  // absolute url is needed for server side
  // dev works with a hard coded url in .env
  const url = getAbsUrl("/api/group/all");

  const res = await fetch(url);

  const results = (await res.json()) as AllGroupResponse[];

  if (!results) {
    console.error("something went wrong - no images to load?");
    return [];
  }

  // remove undefined images -- why are they in there?
  results.forEach((group) => {
    group.images = group.images.filter((c) => c !== undefined);
  });

  // sort the groups by max/newest date of images
  results.sort((a, b) => {
    const aDate = a.images.reduce((acc, cur) => {
      if (cur === undefined) {
        return acc;
      }
      if (cur.dateCreated > acc) {
        return cur.dateCreated;
      }
      return acc;
    }, "0");

    const bDate = b.images.reduce((acc, cur) => {
      if (cur === undefined) {
        return acc;
      }
      if (cur.dateCreated > acc) {
        return cur.dateCreated;
      }
      return acc;
    }, "0");

    return bDate > aDate ? 1 : bDate < aDate ? -1 : 0;
  });

  return results;
}

export function getAbsUrl(slug: string) {
  return (
    (process.env.ASSUMED_PROTOCOL ?? "") + (process.env.VERCEL_URL ?? "") + slug
  );
}

import { useQuery } from "react-query";

import { api_getStudy } from "../model/api";

import type { SdImageStudyDef } from "../libs/shared-types/src";

export function useGetStudy(studyId: string, initialData?: SdImageStudyDef) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [studyId],
    queryFn: queryFnGetStudy,
    initialData,
  });

  if (data === undefined) {
    throw new Error("Study not found");
  }

  return { studyData: data };
}

export async function queryFnGetStudy({ queryKey }: { queryKey: any[] }) {
  const studyId = queryKey[0];

  const initialStudyDef = await api_getStudy(studyId);

  return initialStudyDef;
}

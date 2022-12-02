import axios from "axios";

import { getAbsUrl } from "../components/useGetAllGroups";

import type { AxiosResponse } from "axios";
import type {
  SdImage,
  SdImageGroup,
  SdImagePlaceHolder,
  SdImageStudyDef,
} from "../libs/shared-types/src";

interface SdImgGenReqExtras {
  imageData?: string;
  maskData?: string;
}

export type ImgObj = SdImage | SdImagePlaceHolder;
export type ImgObjWithExtras = ImgObj & SdImgGenReqExtras;

type ImgOrImgArray = ImgObjWithExtras | ImgObjWithExtras[];

export async function api_generateImage(image: ImgOrImgArray) {
  // hit the img_gen api -- this will bulk process if an array is sent
  const res = await axios.post("/api/img_gen", image);

  const img = res.data as SdImage[];

  return img;
}

export function api_updateGroupData(postData: SdImageGroup) {
  axios.put<any, any, SdImageGroup>(
    `/api/group/${postData.id}`,
    postData as any
  );
}

export const api_upsertStudy = (postData) =>
  simplePost<SdImageStudyDef, SdImageStudyDef[]>(`/api/studies`, postData);

export const api_deleteStudy = (studyDef) =>
  simpleDelete<SdImageStudyDef, any>(`/api/studies`, studyDef);

export async function api_getStudy(id: string) {
  const url = getAbsUrl(`/api/studies/${id}`);

  const res = await axios.get<SdImageStudyDef>(url);
  const data = res.data;

  return data;
}

async function simplePost<TPostData, TResData>(url: string, data: any) {
  const res = await axios.post<TResData, AxiosResponse<TResData>, TPostData>(
    url,
    data as any
  );

  return res.data;
}

async function simpleDelete<TDelData, TResData = any>(
  url: string,
  data: TDelData
) {
  const res = await axios.delete<TResData>(url, { data });

  return res.data;
}

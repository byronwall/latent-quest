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

export const simpleDelete =
  <TDelData, TResData = any>(relativeUrl: string) =>
  async (data: TDelData) => {
    const absoluteUrl = getAbsUrl(relativeUrl);
    const res = await axios.delete<TResData>(absoluteUrl, { data });

    return res.data;
  };

export const simplePut =
  <TPutData, TResData = any>(relativeUrl: string) =>
  async (data: TPutData) => {
    const absoluteUrl = getAbsUrl(relativeUrl);
    const res = await axios.put<TResData, AxiosResponse<TResData>, TPutData>(
      absoluteUrl,
      data as any
    );

    return res.data;
  };

export const simpleGet =
  <TResData = any>(relativeUrl: string) =>
  async () => {
    const absoluteUrl = getAbsUrl(relativeUrl);
    const res = await axios.get<TResData, AxiosResponse<TResData>>(absoluteUrl);

    return res.data;
  };

export const api_deleteStudy = simpleDelete<SdImageStudyDef, any>(
  `/api/studies`
);

import axios from "axios";

import { getAbsUrl } from "../components/useGetAllGroups";

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

export function api_upsertStudy(postData: SdImageStudyDef) {
  axios.post<any, any, SdImageStudyDef>(`/api/studies`, postData as any);
}

export async function api_getStudy(id: string) {
  const url = getAbsUrl(`/api/studies/${id}`);

  const res = await axios.get<SdImageStudyDef>(url);
  const data = res.data;

  return data;
}

import { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";
import axios from "axios";

export async function api_generateImage(image: SdImagePlaceHolder) {
  // hit the img_gen api
  const res = await axios.post("/api/img_gen", image);

  const img = res.data as SdImage;

  console.log("image generated", img);

  return img;
}
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import stream from "stream";
import { promisify } from "util";
import * as fs from "fs";
import {
  getTextForBreakdown,
  getUuid,
  SdImagePlaceHolder,
} from "./shared-types/src";
import { join } from "path";
import { pathToImg } from "../pages/api/img_gen";
import { saveImageToS3AndDb } from "../pages/api/saveImageToS3AndDb";
import { getTextOnlyFromPromptPartWithLabel } from "../components/getTextOnlyFromPromptPartWithLabel";
import { SdImgGenParams } from "../pages/api/generateSdImage";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export async function generateDalleImage(imageReq: SdImgGenParams) {
  const response = await openai.createImage({
    prompt: imageReq.promptForSd,
    n: 1,
    size: "512x512",
  });

  const results = response.data;

  console.log("results", results);

  // download each image to the tmp folder
  for (const image of results.data) {
    if (image.url === undefined) {
      console.log("image.url is undefined");
      continue;
    }

    const filename = await downloadUrlToTmp(image.url);

    const finalImage = await saveImageToS3AndDb(
      filename,
      getUuid(),
      imageReq.promptBreakdown,
      0,
      0,
      -1,
      imageReq.groupId ?? getUuid(),
      "DALL-E"
    );

    return finalImage;
  }
}

async function downloadUrlToTmp(url: string) {
  const fileName = url.split("/").pop() ?? "image.png";
  const image_path = join(pathToImg, fileName);

  console.log("image_path", image_path, url);

  const response = await axios({
    url,
    responseType: "stream",
  });

  const prom = new Promise<string>((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(image_path))
      .on("finish", () => resolve(image_path))
      .on("error", (e) => reject(e));
  });

  const finalPath = await prom;

  return finalPath;
}

export interface OpenAiImageResult {
  url: string;
}

export interface OpenAiImageResponse {
  created: number;
  data: OpenAiImageResult[];
}

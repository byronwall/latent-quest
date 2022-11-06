import axios from "axios";
import * as fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import { join } from "path";

import { SdImgGenParams } from "../pages/api/generateSdImage";
import { getStreamForImageUrl } from "../pages/api/images/s3/[key]";
import { pathToImg } from "../pages/api/img_gen";
import { saveImageToS3AndDb } from "../pages/api/saveImageToS3AndDb";
import { getUuid } from "./shared-types/src";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export async function generateDalleImage(imageReq: SdImgGenParams) {
  // see : https://beta.openai.com/docs/api-reference/images/create

  let response;
  if (imageReq.variantSourceId) {
    console.log("creating DALL-E variant");

    const stream = await getStreamForImageUrl(imageReq.variantSourceId);

    // types are wrong, should really be a stream
    response = await openai.createImageVariation(stream as any, 1, "512x512");
  } else {
    response = await openai.createImage({
      prompt: imageReq.promptForSd,
      n: 1,
      size: "512x512",
    });
  }

  const results = response.data;

  console.log("results", results);

  // download each image to the tmp folder
  for (const image of results.data) {
    if (image.url === undefined) {
      console.log("image.url is undefined");
      continue;
    }

    const filename = await downloadUrlToTmp(image.url);

    const finalImage = await saveImageToS3AndDb({
      filename,
      fileKey: getUuid(),
      promptBreakdown: imageReq.promptBreakdown,
      seed: imageReq.seed, // this is a dummy value - seed does not apply to DALL-E
      cfg: 10, // rigged to compare to SD
      steps: 20, // rigged to compare to SD
      groupId: imageReq.groupId ?? getUuid(),
      engine: "DALL-E",
    });

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

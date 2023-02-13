import * as fs from "fs";
import { join } from "path";

import axios from "axios";
import { Configuration, OpenAIApi } from "openai";

import { getUuid } from "./shared-types/src";

import { getBufferFromBase64 } from "../pages/api/generateSdImage";
import { getStreamForImageUrl } from "../pages/api/images/s3/[key]";
import { pathToImg } from "../pages/api/img_gen";
import { saveImageToS3AndDb } from "../pages/api/saveImageToS3AndDb";

import type { SdImgGenParams } from "./shared-types/src";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);

export async function generatePromptHelper(
  topic: string,
  artistOrStart: string
) {
  const artistPart = artistOrStart
    ? ` Ensure each prompt starts with "${artistOrStart}, ". `
    : "";

  const prompt = `An artist has been commissioned to do a piece focused on a "${topic}".  Please provide a description of this piece focusing on the settings, objects, times of day, colors, vibes, views, angles, people, and places it might include.  Be descriptive and aim for 10-20 words per prompt.  ${artistPart}Generate 5 total prompts..\n1.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0.16,
    presence_penalty: 0.13,
  });

  const results = response.data;

  return `1. ${results.choices[0].text}`;
}

export async function generateDalleImage(sdImage: SdImgGenParams) {
  // see : https://beta.openai.com/docs/api-reference/images/create

  // pull out image data so it does not save to DB
  const { promptForSd, imageData, maskData } = sdImage;

  if (promptForSd === undefined) {
    throw new Error("promptForSd is undefined");
  }

  let response;
  if (sdImage.variantSourceId) {
    console.log("creating DALL-E variant");

    const stream = await getStreamForImageUrl(sdImage.variantSourceId);

    // types are wrong, should really be a stream
    response = await openai.createImageVariation(stream as any, 1, "512x512");
  } else if (imageData) {
    console.log("creating DALL-E variant from imageData");

    if (maskData === undefined) {
      throw new Error("maskData is required when imageData is provided");
    }

    // mask must be provided by the client
    // DALL-E expects to see 0 alpha for pixels to be edited
    const stream = getBufferFromBase64(imageData);
    const mask = getBufferFromBase64(maskData);

    const imgPath = join(pathToImg, `${getUuid()}-image.png`);
    const maskPath = join(pathToImg, `${getUuid()}-mask.png`);

    console.log("wrote images to disk temp:", imgPath, maskPath);

    // write to disk temp
    fs.writeFileSync(imgPath, stream);
    fs.writeFileSync(maskPath, mask);

    // types are wrong, should really be a stream
    response = await openai.createImageEdit(
      fs.createReadStream(imgPath) as any,
      fs.createReadStream(maskPath) as any,
      promptForSd,
      1,
      "512x512"
    );
  } else {
    response = await openai.createImage({
      prompt: promptForSd,
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

    const finalImage = await saveImageToS3AndDb(
      {
        ...sdImage,
        cfg: 10, // rigged to compare to SD
        steps: 20, // rigged to compare to SD
        groupId: sdImage.groupId ?? getUuid(),
        engine: "DALL-E",
      },
      { pathToReadOnDisk: filename, s3Key: getUuid() }
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

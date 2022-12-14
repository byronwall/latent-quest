import { generateSdImage } from "./generateSdImage";

import { getTextOnlyFromPromptPartWithLabel } from "../../components/getTextOnlyFromPromptPartWithLabel";
import { generateDalleImage } from "../../libs/openai";
import {
  getRandomSeed,
  getTextForBreakdown,
  getUuid,
} from "../../libs/shared-types/src";

import type {
  ImageGenRequest,
  SdImage,
  SdImgGenParams,
} from "../../libs/shared-types/src";

export const pathToImg = "/tmp";
console.log("pathToImg", pathToImg);

export default async function handler(req, res) {
  // adding timeout code to trap when the lambda times out

  const start = +Date.now();
  console.log("img gen start");

  const imgGenReqReq = req.body as ImageGenRequest | ImageGenRequest[];

  const imgGenReqs = Array.isArray(imgGenReqReq)
    ? imgGenReqReq
    : [imgGenReqReq];

  const results = await Promise.all(imgGenReqs.map(processSingleImgGenReq));
  const goodResults = results.filter((r) => r !== undefined) as SdImage[];

  const end = +Date.now();
  console.log("img gen done in ", end - start, "ms");

  res.status(200).json(goodResults);
}

async function processSingleImgGenReq(
  imgGenReq: ImageGenRequest
): Promise<SdImage | undefined> {
  const seed = imgGenReq.seed ?? getRandomSeed();
  const cfg = imgGenReq.cfg ?? 10;
  const steps = imgGenReq.steps ?? 20;
  const prompt = getTextForBreakdown(imgGenReq.promptBreakdown);

  // wait until the last minute to remove any meta data labels
  const promptForSd = getTextOnlyFromPromptPartWithLabel(prompt);
  const groupId = imgGenReq.groupId ?? getUuid();
  const promptBreakdown = imgGenReq.promptBreakdown;

  // send in placeholder and overrides
  const finalImgReq: SdImgGenParams = {
    ...imgGenReq,
    promptForSd,
    cfg,
    groupId,
    promptBreakdown,
    seed,
    steps,
  };

  try {
    if (imgGenReq.engine === "DALL-E") {
      const result = await generateDalleImage(finalImgReq);
      return result;
    }

    if (imgGenReq.engine.startsWith("SD")) {
      const imgResult = await generateSdImage(finalImgReq);
      return imgResult;
    }
  } catch (e: any) {
    console.log("error", e);
  }
  return undefined;
}

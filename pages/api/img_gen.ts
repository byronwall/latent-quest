import { getTextOnlyFromPromptPartWithLabel } from "../../components/getTextOnlyFromPromptPartWithLabel";
import { generateDalleImage } from "../../libs/openai";
import {
  getTextForBreakdown,
  getUuid,
  ImageGenRequest,
  SdImage,
} from "../../libs/shared-types/src";
import { generateSdImage, SdImgGenParams } from "./generateSdImage";

export const pathToImg = "/tmp";
console.log("pathToImg", pathToImg);

export default async function handler(req, res) {
  const imgGenReqReq = req.body as ImageGenRequest | ImageGenRequest[];

  const imgGenReqs = Array.isArray(imgGenReqReq)
    ? imgGenReqReq
    : [imgGenReqReq];

  const results = await Promise.all(imgGenReqs.map(processSingleImgGenReq));
  const goodResults = results.filter((r) => r !== undefined) as SdImage[];

  res.status(200).json(goodResults);
}

async function processSingleImgGenReq(
  imgGenReq: ImageGenRequest
): Promise<SdImage | undefined> {
  const seed = imgGenReq.seed ?? Math.floor(Math.random() * 100000);
  const cfg = imgGenReq.cfg ?? 10;
  const steps = imgGenReq.steps ?? 20;
  const prompt = getTextForBreakdown(imgGenReq.promptBreakdown);

  // wait until the last minute to remove any meta data labels
  const promptForSd = getTextOnlyFromPromptPartWithLabel(prompt);
  const groupId = imgGenReq.groupId ?? getUuid();
  const promptBreakdown = imgGenReq.promptBreakdown;

  const finalImgReq: SdImgGenParams = {
    promptForSd,
    cfg,
    groupId,
    promptBreakdown,
    seed,
    steps,
  };

  try {
    switch (imgGenReq.engine) {
      case "DALL-E":
        const result = await generateDalleImage(finalImgReq);
        return result;
      case "SD 1.5":
        const imgResult = await generateSdImage(finalImgReq);
        return imgResult;
    }
  } catch (e: any) {
    console.log("error", e);
  }
  return undefined;
}

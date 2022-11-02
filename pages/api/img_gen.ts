import { generateAsync } from "stability-client";
import { getTextOnlyFromPromptPartWithLabel } from "../../components/getTextOnlyFromPromptPartWithLabel";

import { db_insertGroup, db_insertImage } from "../../libs/db";
import { uploadImageToS3 } from "../../libs/s3_helpers";
import {
  createDefaultViewSettings,
  getTextForBreakdown,
  getUuid,
  ImageGenRequest,
  SdImage,
} from "../../libs/shared-types/src";

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
  const groupId = imgGenReq.groupId;
  const promptBreakdown = imgGenReq.promptBreakdown;

  try {
    const { images } = (await generateAsync({
      apiKey: process.env.STABILITY_KEY ?? "",
      seed,
      cfgScale: cfg,
      steps,
      prompt: promptForSd,
      height: 512,
      width: 512,
      samples: 1,
      outDir: pathToImg,
      debug: false,
      noStore: false,
    })) as any;

    if (images.length > 0) {
      const result = images[0];

      const fileKey = result.filePath.replace(pathToImg + "/", "");

      const s3MetaData = {
        filename: result.filePath,
        key: fileKey,
        mimetype: "image/png",
      };

      console.log("s3MetaData", s3MetaData);

      const s3res = await uploadImageToS3(s3MetaData);

      // delete the file after done ?

      const imgResult: SdImage = {
        id: getUuid(),
        promptBreakdown,
        seed,
        cfg,
        steps,
        url: fileKey,
        dateCreated: new Date().toISOString(),
        groupId: groupId ?? getUuid(),
      };
      // need to load to S3

      await db_insertImage(imgResult);
      await db_insertGroup({
        id: imgResult.groupId,
        view_settings: createDefaultViewSettings(),
      });

      return imgResult;
    }
  } catch (e: any) {
    console.log("error", e);
  }
  return undefined;
}

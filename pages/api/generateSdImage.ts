import { generateAsync } from "stability-client";

import { PromptBreakdown } from "../../libs/shared-types/src";
import { pathToImg } from "./img_gen";
import { saveImageToS3AndDb } from "./saveImageToS3AndDb";

export type SdImgGenParams = {
  seed: number;
  cfg: number;
  steps: number;
  promptForSd: string;
  promptBreakdown: PromptBreakdown;
  groupId: string;
};

export async function generateSdImage({
  seed,
  cfg,
  steps,
  promptForSd,
  promptBreakdown,
  groupId,
}: SdImgGenParams) {
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

    return await saveImageToS3AndDb(
      result.filePath,
      fileKey,
      promptBreakdown,
      seed,
      cfg,
      steps,
      groupId,
      "SD 1.5"
    );
  }
}

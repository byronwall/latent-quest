import { generateAsync } from "stability-client";

import { SdImagePlaceHolder } from "../../libs/shared-types/src";
import { getBufferFromImageUrl } from "./images/s3/[key]";
import { pathToImg } from "./img_gen";
import { saveImageToS3AndDb } from "./saveImageToS3AndDb";

export type SdImgGenParams = {
  promptForSd: string;
} & SdImagePlaceHolder &
  Required<Pick<SdImagePlaceHolder, "seed" | "cfg" | "steps" | "groupId">>;

type SdParams = Parameters<typeof generateAsync>[0];

export async function generateSdImage(input: SdImgGenParams) {
  const { seed, cfg, steps, promptForSd, promptBreakdown, groupId } = input;
  const sdParams: SdParams = {
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
  };

  // if placeholder has a variant, download that image and add to json

  if (input.variantSourceId) {
    // download image
    type VariantParams = Pick<SdParams, "imagePrompt" | "stepSchedule">;
    console.log("generating variant");

    const buffer = await getBufferFromImageUrl(input.variantSourceId);

    const variantParams: VariantParams = {
      imagePrompt: {
        content: buffer,
        mime: "image/png",
      },
      stepSchedule: {
        start: input.variantStrength ?? 0.5,
      },
    };

    // force values if origin was DALL-E
    if (input.engine === "DALL-E") {
      sdParams.steps = 20;
      sdParams.cfgScale = 10;
      sdParams.seed = Math.floor(Math.random() * 65000);
      sdParams.engine = undefined;
    }

    console.log("variantParams", variantParams);

    Object.assign(sdParams, variantParams);

    console.log("sd params", sdParams);
  }

  const { images } = (await generateAsync(sdParams)) as any;

  if (images.length > 0) {
    const result = images[0];

    const fileKey = result.filePath.replace(pathToImg + "/", "");

    return await saveImageToS3AndDb({
      filename: result.filePath,
      fileKey,
      promptBreakdown,
      seed,
      cfg,
      steps,
      groupId,
      engine: "SD 1.5",
    });
  }
}

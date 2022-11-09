import { generateAsync } from "stability-client";

import { SdImagePlaceHolder } from "../../libs/shared-types/src";
import { getBufferFromImageUrl } from "./images/s3/[key]";
import { pathToImg } from "./img_gen";
import { saveImageToS3AndDb } from "./saveImageToS3AndDb";

export type SdImgGenParams = {
  promptForSd: string;
  imageData?: string;
  maskData?: string;
} & SdImagePlaceHolder &
  Required<Pick<SdImagePlaceHolder, "seed" | "cfg" | "steps" | "groupId">>;

type SdParams = Parameters<typeof generateAsync>[0];

const base64Regex = /^data:.+\/(.+);base64,(.*)$/;

function getBufferFromBase64(base64: string) {
  const matches = base64.match(base64Regex);
  if (!matches) {
    throw new Error("Invalid base64 string");
  }
  const [, , base64Data] = matches;
  return Buffer.from(base64Data, "base64");
}

export async function generateSdImage(input: SdImgGenParams) {
  const { promptForSd, ...sdImage } = input;

  const { seed, cfg, steps, groupId } = sdImage;

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
  type VariantParams = Pick<SdParams, "imagePrompt" | "stepSchedule">;

  if (sdImage.imageData) {
    var buffer = getBufferFromBase64(sdImage.imageData);

    const variantParams: VariantParams = {
      imagePrompt: {
        content: buffer,
        mime: "image/png",
      },
      stepSchedule: {
        start: input.variantStrength ?? 0.5,
      },
    };

    // check for a mask too
    if (
      sdImage.maskData &&
      variantParams.imagePrompt &&
      variantParams.stepSchedule
    ) {
      var maskBuffer = getBufferFromBase64(sdImage.maskData);

      variantParams.imagePrompt.mask = {
        content: maskBuffer,
        mime: "image/png",
      };

      variantParams.stepSchedule.start = 1;
    }

    Object.assign(sdParams, variantParams);
    delete sdImage.imageData; // this is needed so db write is OK -- don't want to save this data for now
    delete sdImage.maskData; // this is needed so db write is OK -- don't want to save this data for now
  } else if (input.variantSourceId) {
    // download image

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

    Object.assign(sdParams, variantParams);
  }

  const { images } = (await generateAsync(sdParams)) as any;

  if (images.length > 0) {
    const result = images[0];

    const fileKey = result.filePath.replace(pathToImg + "/", "");

    return await saveImageToS3AndDb(
      {
        ...sdImage,
        engine: "SD 1.5",
      },
      { filename: result.filePath, fileKey }
    );
  }
}

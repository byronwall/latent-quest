import { getBufferFromImageUrl } from "./images/s3/[key]";
import { pathToImg } from "./img_gen";
import { saveImageToS3AndDb } from "./saveImageToS3AndDb";

import { generateAsync } from "../../libs/db/stability-grpc/sd_grpc_index";

import type {
  SdImageEngines,
  SdImgGenParams,
} from "../../libs/shared-types/src";

type SdParams = Parameters<typeof generateAsync>[0];

const base64Regex = /^data:.+\/(.+);base64,(.*)$/;

export function getBufferFromBase64(base64: string) {
  const matches = base64.match(base64Regex);
  if (!matches) {
    throw new Error("Invalid base64 string");
  }
  const [, , base64Data] = matches;
  return Buffer.from(base64Data, "base64");
}

const engineLabelMap: Partial<Record<SdImageEngines, string>> = {
  "SD 1.4": "stable-diffusion-v1",
  "SD 1.5": "stable-diffusion-v1-5",
  "SD 2.0 512px": "stable-diffusion-512-v2-0",
  "SD 2.0 768px": "stable-diffusion-768-v2-0",
  "SD 2.1 512px": "stable-diffusion-512-v2-1",
  "SD 2.1 768px": "stable-diffusion-768-v2-1",
  "SD 2.0 inpaint": "stable-inpainting-512-v2-0",
};

const defaultEngine = engineLabelMap["SD 1.5"];

export async function generateSdImage(sdImage: SdImgGenParams) {
  const { seed, cfg, steps, groupId, promptForSd, engine } = sdImage;

  if (promptForSd === undefined) {
    throw new Error("promptForSd is required");
  }

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
    engine: engineLabelMap[engine] ?? defaultEngine,
  };

  // if placeholder has a variant, download that image and add to json
  type VariantParams = Pick<SdParams, "imagePrompt" | "stepSchedule">;

  // store a copy of the source image (mask + prompt) in S3
  // get those URLs and write them to the image data

  const imagePromptDataToSave: Pick<
    SdImgGenParams,
    "urlImageSource" | "urlMaskSource" | "imageData" | "maskData"
  > = {};

  if (sdImage.imageData) {
    const buffer = getBufferFromBase64(sdImage.imageData);

    const variantParams: VariantParams = {
      imagePrompt: {
        content: buffer,
        mime: "image/png",
      },
      stepSchedule: {
        start: sdImage.variantStrength ?? 0.5,
      },
    };

    // check for a mask too
    if (
      sdImage.maskData &&
      variantParams.imagePrompt &&
      variantParams.stepSchedule
    ) {
      const maskBuffer = getBufferFromBase64(sdImage.maskData);

      variantParams.imagePrompt.mask = {
        content: maskBuffer,
        mime: "image/png",
      };

      variantParams.stepSchedule.start = 1;
    }

    Object.assign(sdParams, variantParams);

    imagePromptDataToSave.imageData = sdImage.imageData;
  } else if (sdImage.variantSourceId) {
    // download image

    const buffer = await getBufferFromImageUrl(sdImage.variantSourceId);

    const variantParams: VariantParams = {
      imagePrompt: {
        content: buffer,
        mime: "image/png",
      },
      stepSchedule: {
        start: sdImage.variantStrength ?? 0.5,
      },
    };

    // force values if origin was DALL-E
    if (sdImage.engine === "DALL-E") {
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
        engine: sdImage.engine ?? "SD 1.5",
      },
      { pathToReadOnDisk: result.filePath, s3Key: fileKey }
    );
  }
}

import { getBufferFromBase64 } from "./generateSdImage";

import { uploadImageToS3 } from "../../libs/s3_helpers";
import {
  createDefaultViewSettings,
  getUuid,
} from "../../libs/shared-types/src";
import { db_insertGroup } from "../../libs/db/groups";
import { db_insertImage } from "../../libs/db/images";

import type { FileUploadS3 } from "../../libs/s3_helpers";
import type { SdImage, SdImgGenParams } from "../../libs/shared-types/src";

export async function saveImageToS3AndDb(
  image: SdImgGenParams,
  reqParams: FileUploadS3
) {
  const s3res = uploadImageToS3(reqParams);

  // check and remove the imageData if needed

  const promises: Promise<any>[] = [];

  if (image.variantSourceId) {
    // map the variant through to the image data if used
    image.urlImageSource = image.variantSourceId;
  }

  if (image.imageData) {
    // write this data to S3 and then delete from image

    const imageDataS3Key = "img_" + reqParams.s3Key;

    // write the image data to disk

    const imageDataS3res = uploadImageToS3({
      buffer: getBufferFromBase64(image.imageData),
      s3Key: imageDataS3Key,
    });

    promises.push(imageDataS3res);

    delete image.imageData;
    image.urlImageSource = imageDataS3Key;
  }

  // check and remove the maskData if needed
  if (image.maskData) {
    // write this data to S3 and then delete from image

    const maskDataS3Key = "mask_" + reqParams.s3Key;

    // write the image data to disk

    const maskDataS3res = uploadImageToS3({
      buffer: getBufferFromBase64(image.maskData),
      s3Key: maskDataS3Key,
    });

    promises.push(maskDataS3res);

    delete image.maskData;
    image.urlMaskSource = maskDataS3Key;
  }

  if (image.promptForSd) {
    // remove this extra field
    delete image.promptForSd;
  }

  console.log("waiting on S3 writes");
  promises.push(s3res);

  await Promise.all(promises);

  console.log("S3 writes done");

  // delete the file after done ?

  const imgResult: SdImage = {
    ...image,

    id: getUuid(),
    url: reqParams.s3Key,
    dateCreated: new Date().toISOString(),
  };

  // need to load to S3
  await db_insertGroup({
    id: image.groupId,
    view_settings: createDefaultViewSettings(),
  });

  await db_insertImage(imgResult);

  return imgResult;
}

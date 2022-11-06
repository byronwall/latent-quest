import { db_insertGroup, db_insertImage } from "../../libs/db";
import { uploadImageToS3 } from "../../libs/s3_helpers";
import {
  createDefaultViewSettings,
  getUuid,
  SdImage,
  SdImagePlaceHolder,
} from "../../libs/shared-types/src";

export async function saveImageToS3AndDb(
  image: SdImagePlaceHolder &
    Required<Pick<SdImagePlaceHolder, "groupId" | "seed" | "cfg" | "steps">>,
  reqParams: {
    filename: string;
    fileKey: any;
  }
) {
  const { filename, fileKey } = reqParams;

  const s3MetaData = {
    filename,
    key: fileKey,
    mimetype: "image/png",
  };

  console.log("s3MetaData", s3MetaData);

  const s3res = await uploadImageToS3(s3MetaData);

  // delete the file after done ?

  const imgResult: SdImage = {
    ...image,

    id: getUuid(),
    url: fileKey,
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

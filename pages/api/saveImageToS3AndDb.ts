import { db_insertGroup, db_insertImage } from "../../libs/db";
import { uploadImageToS3 } from "../../libs/s3_helpers";
import {
  createDefaultViewSettings,
  getUuid,
  PromptBreakdown,
  SdImage,
  SdImageEngines,
} from "../../libs/shared-types/src";

type SdSaveToS3Params = {
  filename: string;
  fileKey: any;
  promptBreakdown: PromptBreakdown;
  seed: number;
  cfg: number;
  steps: number;
  groupId: string;
  engine: SdImageEngines;
};

export async function saveImageToS3AndDb({
  filename,
  fileKey,
  promptBreakdown,
  seed,
  cfg,
  steps,
  groupId,
  engine,
}: SdSaveToS3Params) {
  const s3MetaData = {
    filename,
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
    groupId: groupId,
    engine,
  };
  // need to load to S3
  await db_insertGroup({
    id: imgResult.groupId,
    view_settings: createDefaultViewSettings(),
  });
  await db_insertImage(imgResult);

  return imgResult;
}

import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import * as fs from "fs";

const s3 = new S3Client({
  region: process.env.LQ_AWS_REGION,
  credentials: {
    accessKeyId: process.env.LQ_AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.LQ_AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export type FileUploadS3 = FileUploadS3Path | FileUploadS3Buffer;

export interface FileUploadS3Path {
  pathToReadOnDisk: string;
  s3Key: string;
}

export interface FileUploadS3Buffer {
  buffer: Buffer;
  s3Key: string;
}

// type guard to detect a FileUploadS3Buffer
export function isFileUploadS3Buffer(
  file: FileUploadS3
): file is FileUploadS3Buffer {
  return "buffer" in file;
}

export interface FileDownloadS3 {
  key: string;
}

export async function uploadImageToS3(file: FileUploadS3) {
  const Body: PutObjectCommandInput["Body"] = isFileUploadS3Buffer(file)
    ? file.buffer
    : fs.createReadStream(file.pathToReadOnDisk);

  // upload image to s3

  const command = new PutObjectCommand({
    Bucket: process.env.LQ_AWS_BUCKET_NAME,
    Key: file.s3Key,
    Body,
  });

  return await s3.send(command);
}

export async function getImagesFromS3(file: FileDownloadS3) {
  const downloadParams = {
    Key: file.key,
    Bucket: process.env.LQ_AWS_BUCKET_NAME,
  };

  const command = new GetObjectCommand(downloadParams);
  const data = await s3.send(command);

  return data;
}

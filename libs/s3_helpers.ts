import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as fs from "fs";

const s3 = new S3Client({
  region: process.env.LQ_AWS_REGION,
  credentials: {
    accessKeyId: process.env.LQ_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.LQ_AWS_SECRET_ACCESS_KEY,
  },
});

export interface FileUploadS3 {
  filename: string;
  key: string;
  mimetype: string;
}

export interface FileDownloadS3 {
  key: string;
}

export async function uploadImageToS3(file: FileUploadS3) {
  const fileStream = fs.createReadStream(file.filename);

  // upload image to s3
  const params = {
    Bucket: process.env.LQ_AWS_BUCKET_NAME,
    Key: file.key,
    Body: fileStream,
  };

  const command = new PutObjectCommand(params);

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

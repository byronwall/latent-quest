import * as fs from "fs";
import path from "path";
import { Readable } from "stream";

import { getImagesFromS3 } from "../../../../libs/s3_helpers";
import { pathToImg } from "../../img_gen";

import type { Stream } from "stream";

export default async function handler(req, res) {
  const { key: imageUrl } = req.query;

  // TODO use the new stream apporach to simplify this API call

  // attempt to load from disk

  const possibleTempPath = path.join(pathToImg, imageUrl);

  const fileExists = fs.existsSync(possibleTempPath);

  if (fileExists) {
    res.setHeader("Cache-Control", "maxage=86400, s-maxage=86400");
    res.status(200);
    fs.createReadStream(possibleTempPath).pipe(res);

    return;
  }

  const badFileExists = fs.existsSync(possibleTempPath + ".bad");
  if (badFileExists) {
    res.status(500).send("Bad image URL");
    return;
  }

  console.log("possibleTempPath", possibleTempPath, fileExists);

  // load image from S3
  try {
    const s3res = await getImagesFromS3({ key: imageUrl });

    const writeStream = fs.createWriteStream(possibleTempPath);
    (s3res.Body as Readable).pipe(writeStream);
    (s3res.Body as Readable).pipe(res);

    return;
  } catch (e: any) {
    fs.writeFileSync(possibleTempPath + ".bad", e.message);

    console.log("error", e);
    res.status(500).send("error");
  }
}

async function stream2buffer(stream: Stream): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const _buf = Array<any>();

    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", (err) => reject(`error converting stream - ${err}`));
  });
}

export async function getLocalImagePathWithDownload(
  imageUrl: string
): Promise<string> {
  const possibleTempPath = path.join(pathToImg, imageUrl);

  const fileExists = fs.existsSync(possibleTempPath);

  if (fileExists) {
    return possibleTempPath;
  }

  const badFileExists = fs.existsSync(possibleTempPath + ".bad");
  if (badFileExists) {
    throw new Error("Bad image URL");
  }

  console.log("possibleTempPath", possibleTempPath, fileExists);

  // load image from S3
  try {
    // flow:
    // 1. get image from S3
    // 2. write to disk
    // 3. return stream pointed to disk

    const s3res = await getImagesFromS3({ key: imageUrl });

    if (!(s3res.Body instanceof Readable)) {
      throw new Error("s3res.Body is not a Readable");
    }

    const writeStream = fs.createWriteStream(possibleTempPath);
    s3res.Body.pipe(writeStream);

    return possibleTempPath;
  } catch (e: any) {
    console.log("error", e);
  }

  throw new Error("error");
}

export async function getStreamForImageUrl(imageUrl: string): Promise<Stream> {
  const possibleTempPath = path.join(pathToImg, imageUrl);

  const fileExists = fs.existsSync(possibleTempPath);

  if (fileExists) {
    return fs.createReadStream(possibleTempPath);
  }

  const badFileExists = fs.existsSync(possibleTempPath + ".bad");
  if (badFileExists) {
    throw new Error("Bad image URL");
  }

  console.log("possibleTempPath", possibleTempPath, fileExists);

  // load image from S3
  try {
    // flow:
    // 1. get image from S3
    // 2. write to disk
    // 3. return stream pointed to disk

    const s3res = await getImagesFromS3({ key: imageUrl });

    if (!(s3res.Body instanceof Readable)) {
      throw new Error("s3res.Body is not a Readable");
    }

    const writeStream = fs.createWriteStream(possibleTempPath);
    s3res.Body.pipe(writeStream);

    const readStream = fs.createReadStream(possibleTempPath);

    return readStream;
  } catch (e: any) {
    fs.writeFileSync(possibleTempPath + ".bad", e.message);

    throw new Error("problem loading image");
  }
}

export async function getBufferFromImageUrl(imageUrl: string): Promise<Buffer> {
  const stream = await getStreamForImageUrl(imageUrl);

  return await stream2buffer(stream);
}

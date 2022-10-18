import path from "path";
import * as fs from "fs";
import { getImagesFromS3 } from "../../../../libs/s3_helpers";
import { pathToImg } from "../../img_gen";
import { Readable } from "stream";

export default async function handler(req, res) {
  const { key } = req.query;

  // attempt to load from disk

  const possibleTempPath = path.join(pathToImg, key);

  const fileExists = fs.existsSync(possibleTempPath);

  if (fileExists) {
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
    const s3res = await getImagesFromS3({ key });

    let writeStream = fs.createWriteStream(possibleTempPath);
    (s3res.Body as Readable).pipe(writeStream);
    (s3res.Body as Readable).pipe(res);

    return;
  } catch (e: any) {
    fs.writeFileSync(possibleTempPath + ".bad", e.message);

    console.log("error", e);
    res.status(500).send("error");
  }
}

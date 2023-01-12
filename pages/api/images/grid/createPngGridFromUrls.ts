import sharp from "sharp";
import { getBufferFromImageUrl } from "../s3/[key]";

export async function createPngGridFromUrls(urls: any[]) {
  const images = await Promise.all(
    urls.map(async (url) => {
      const buffer = await getBufferFromImageUrl(url);

      return buffer;
    })
  );

  const biggerGrid = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      { input: images[0], gravity: "northwest" },
      { input: images[1], gravity: "northeast" },
      { input: images[2], gravity: "southwest" },
      { input: images[3], gravity: "southeast" },
    ])

    .png()
    .toBuffer();

  const data = await sharp(biggerGrid).resize(512).png().toBuffer();
  return data;
}

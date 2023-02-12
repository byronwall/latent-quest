import Link from "next/link";
import Image from "next/image";

import { SdImageComp } from "./SdImageComp";
import { getFinalPromptText } from "./getTextOnlyFromPromptPartWithLabel";
import { getImageUrl } from "./ImageList";

import { getTextForBreakdown } from "../libs/shared-types/src";

import type { SdImage } from "../libs/shared-types/src";

export type SdImagePageProps = {
  initialImage: SdImage;
};
export function SdImagePage(props: SdImagePageProps) {
  const { initialImage } = props;

  const promptText = getFinalPromptText(initialImage);

  return (
    <div className="mx-auto mt-8 flex max-w-lg flex-col gap-4 p-4">
      <div className="text-center text-2xl font-bold">
        <p>{promptText}</p>
      </div>
      <SdImageComp image={initialImage} size={512} shouldShowDetails />

      <table className="w-full table-fixed">
        <thead>
          <tr>
            <th className="w-1/3">Property</th>
            <th className="w-2/3">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-4 py-2">Id</td>
            <td className="border px-4 py-2">{initialImage.id}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Engine</td>
            <td className="border px-4 py-2">{initialImage.engine}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Group ID</td>
            <td className="border px-4 py-2">
              <Link href={`/group/${initialImage.groupId}`} prefetch={false}>
                {initialImage.groupId}
              </Link>
            </td>
          </tr>

          <tr>
            <td className="border px-4 py-2">Breakdown</td>
            <td className="border px-4 py-2">
              {getTextForBreakdown(initialImage.promptBreakdown)}
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Seed</td>
            <td className="border px-4 py-2">{initialImage.seed}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">CFG</td>
            <td className="border px-4 py-2">{initialImage.cfg}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Steps</td>
            <td className="border px-4 py-2">{initialImage.steps}</td>
          </tr>

          <tr>
            <td className="border px-4 py-2">Size</td>
            <td className="border px-4 py-2">{"512 x 512"}</td>
          </tr>

          <tr>
            <td className="border px-4 py-2">Url</td>
            <td className="border px-4 py-2">{initialImage.url}</td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Prev Image ID</td>
            <td className="border px-4 py-2">
              {initialImage.prevImageId ? (
                <Link
                  href={`/image/${initialImage.prevImageId}`}
                  prefetch={false}
                >
                  {initialImage.prevImageId}
                </Link>
              ) : (
                "<none>"
              )}
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Source Image</td>
            <td className="border px-4 py-2">
              {initialImage.urlImageSource ? (
                <Image
                  src={getImageUrl(initialImage.urlImageSource)}
                  width={512}
                  height={512}
                  alt="Source Image"
                />
              ) : (
                "<none>"
              )}
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Mask Image (for in-paint)</td>
            <td className="border px-4 py-2">
              {initialImage.urlMaskSource ? (
                <Image
                  src={getImageUrl(initialImage.urlMaskSource)}
                  width={512}
                  height={512}
                  alt="Source Image"
                />
              ) : (
                "<none>"
              )}
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Variant Strength</td>
            <td className="border px-4 py-2">
              {initialImage.variantStrength ?? "<none>"}
            </td>
          </tr>
          <tr>
            <td className="border px-4 py-2">Created</td>
            <td className="border px-4 py-2">
              {new Date(initialImage.dateCreated).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

import { orderBy } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef } from "react";

import { getImageUrl } from "./ImageList";
import { useWasEverOnScreen } from "./useWasEverOnScreen";

import type { AllGroupResponse } from "./ImageList";

type SdGroupPreviewProps = {
  group: AllGroupResponse;
};

export function SdGroupPreview(props: SdGroupPreviewProps) {
  const { group } = props;

  // get the first 4 images if possible

  // sort images by date

  const ref = useRef<HTMLDivElement>(null);
  const wasEverOnScreen = useWasEverOnScreen(ref);

  const { previewImages, sortedImages } = useMemo(() => {
    const sortedImages = orderBy(group.images, ["dateCreated"], ["desc"]);
    const previewImages = sortedImages.slice(0, 4);
    return { previewImages, sortedImages };
  }, [group.images]);

  const size = 256;

  return (
    <div className={`p-2 ${!wasEverOnScreen ? "h-40" : ""} `} ref={ref}>
      {wasEverOnScreen && (
        <Link href={`/group/${group.id}`} prefetch={false}>
          <div className="cursor-pointer hover:ring-2">
            <div className="grid grid-cols-2 gap-1">
              {previewImages.map((image) => (
                <div key={image.id}>
                  <Image
                    src={getImageUrl(image.url)}
                    width={size}
                    height={size}
                    alt="preview image"
                  />
                </div>
              ))}
            </div>
            <p>{group.view_settings.name} </p>
          </div>
        </Link>
      )}
    </div>
  );
}

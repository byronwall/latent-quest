import { orderBy } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { getImageUrl } from "./ImageList";

import type { AllGroupResponse } from "./ImageList";

type SdGroupPreviewProps = {
  group: AllGroupResponse;
};

export function SdGroupPreview(props: SdGroupPreviewProps) {
  const { group } = props;

  // get the first 4 images if possible

  const groupId = group.id;

  // sort images by date

  const { previewImages, sortedImages } = useMemo(() => {
    const sortedImages = orderBy(group.images, ["dateCreated"], ["desc"]);
    const previewImages = sortedImages.slice(0, 4);
    return { previewImages, sortedImages };
  }, [group.images]);

  const size = 256;

  return (
    <div className="p-2">
      <Link href={`/group/${group.id}`}>
        <div className="cursor-pointer hover:ring-2">
          <Image
            src={`/api/images/grid/${groupId}`}
            width={size}
            height={size}
          />
          <p>{group.view_settings.name} </p>
        </div>
      </Link>
    </div>
  );
}

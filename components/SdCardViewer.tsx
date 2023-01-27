import { Loader } from "@mantine/core";

import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";
import { useInfiniteScroll } from "./useInfiniteScroll";

import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

type SdCardViewerProps = {
  imageGroupData: SdImage[];
  placeholderImages: SdImagePlaceHolder[];

  childCard?: React.ReactNode;
};

export function SdCardViewer(props: SdCardViewerProps) {
  const { imageGroupData, childCard, placeholderImages } = props;

  const imageSize = 512;

  return (
    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-5">
      {childCard}
      {placeholderImages.map((item: SdImagePlaceHolder) => (
        <div key={item.id}>
          <SdImagePlaceHolderComp
            placeholder={item}
            size={imageSize}
            defaultIsLoading
          />
        </div>
      ))}
      {imageGroupData.map((item: SdImage) => (
        <div key={item.id}>
          <SdImageComp
            image={item}
            size={imageSize}
            imageGroupData={imageGroupData}
            shouldShowDetails
          />
        </div>
      ))}
    </div>
  );
}

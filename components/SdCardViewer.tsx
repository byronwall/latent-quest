import { SdImageComp } from "./SdImageComp";

import type { SdImage } from "../libs/shared-types/src";

type SdCardViewerProps = {
  imageGroupData: SdImage[];

  childCard?: React.ReactNode;
};

export function SdCardViewer(props: SdCardViewerProps) {
  const { imageGroupData, childCard } = props;

  const imageSize = 512;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {childCard}
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
    </div>
  );
}

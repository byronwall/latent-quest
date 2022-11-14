import { Button } from "@mantine/core";

import { SdImage } from "../libs/shared-types/src";
import { isPlaceholder } from "./ImageGrid";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

export type SdVariantHandler = (
  image: SdImage,
  engine: SdImage["engine"],
  strength?: number
) => void;

export function SdCardOrTableCell(props: {
  cell: any;
  imageSize: any;

  mainImage: any;
  setMainImage: any;
  onCreateVariant: SdVariantHandler;
}) {
  const { cell, imageSize, mainImage, setMainImage } = props;

  const content =
    cell === undefined ? (
      <div />
    ) : isPlaceholder(cell) ? (
      <SdImagePlaceHolderComp size={imageSize} placeholder={cell} />
    ) : (
      <SdImageComp
        image={cell}
        size={imageSize}
        shouldShowDetails
        onCreateVariant={props.onCreateVariant}
        onSetMainImage={() => setMainImage(cell)}
      />
    );

  return (
    <div>
      {content}
      <div style={{ display: "flex" }}>
        {"id" in cell && (
          <>
            <Button
              onClick={() => setMainImage(cell)}
              color={mainImage.id === cell.id ? "lime" : "blue"}
              compact
            >
              set main
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

import { Button } from "@mantine/core";

import { isPlaceholder } from "./isPlaceholder";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

export type SdVariantHandler = (
  image: SdImage,
  engine: SdImage["engine"],
  strength?: number
) => void;

export function SdCardOrTableCell(props: {
  cell: SdImage | SdImagePlaceHolder;
  imageSize: number;

  mainImage?: SdImage;
  setMainImage?: (image: SdImage) => void;
  onCreateVariant?: SdVariantHandler;
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
        onCreateVariant={props.onCreateVariant}
        onSetMainImage={setMainImage ? () => setMainImage(cell) : undefined}
      />
    );

  return (
    <div>
      {content}
      <div style={{ display: "flex" }}>
        {"id" in cell && mainImage && setMainImage && (
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

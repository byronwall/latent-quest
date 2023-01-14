import { isPlaceholder } from "./isPlaceholder";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";

import type {
  SdImageCompProps,
  SdImageOrPlaceholderCommonProps,
} from "./SdImageComp";
import type { SdImagePlaceHolderCompProps } from "./SdImagePlaceHolderComp";
import type { SdImage, SdImagePlaceHolder } from "../libs/shared-types/src";

export type SdVariantHandler = (
  image: SdImage,
  engine: SdImage["engine"],
  strength?: number
) => void;

type SdCardOrTableCellProps = Partial<SdImagePlaceHolderCompProps> &
  Partial<SdImageCompProps> &
  SdImageOrPlaceholderCommonProps & {
    cell: SdImage | SdImagePlaceHolder;

    mainImage?: SdImage;
  };

export function SdCardOrTableCell(props: SdCardOrTableCellProps) {
  const { cell, mainImage } = props;

  const content =
    cell === undefined ? (
      <div />
    ) : isPlaceholder(cell) ? (
      <SdImagePlaceHolderComp {...props} placeholder={cell} />
    ) : (
      <SdImageComp {...props} image={cell} />
    );

  const isMainImage = mainImage && "id" in cell && mainImage.id === cell.id;

  return (
    <div
      style={{
        border: isMainImage ? "4px solid red" : undefined,
      }}
    >
      {content}
    </div>
  );
}

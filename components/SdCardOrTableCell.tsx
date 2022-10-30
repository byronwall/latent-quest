import { Button } from "@mantine/core";
import { SdImageComp } from "./SdImageComp";
import { SdImagePlaceHolderComp } from "./SdImagePlaceHolderComp";
import { SdPromptToTransform } from "./SdPromptToTransform";
import { isPlaceholder } from "./ImageGrid";

export function SdCardOrTableCell(props: {
  cell: any;
  imageSize: any;
  handleAddLooseTransform: any;
  mainImage: any;
  setMainImage: any;
}) {
  const { cell, imageSize, handleAddLooseTransform, mainImage, setMainImage } =
    props;

  const content =
    cell === undefined ? (
      <div />
    ) : isPlaceholder(cell) ? (
      <SdImagePlaceHolderComp size={imageSize} placeholder={cell} />
    ) : (
      <SdImageComp image={cell} size={imageSize} />
    );

  return (
    <div>
      {content}
      <div style={{ display: "flex" }}>
        <SdPromptToTransform
          promptBreakdown={cell.promptBreakdown}
          onNewTransform={handleAddLooseTransform}
        />
        {"id" in cell && (
          <Button
            onClick={() => setMainImage(cell)}
            color={mainImage.id === cell.id ? "lime" : "blue"}
            compact
          >
            set main
          </Button>
        )}
      </div>
    </div>
  );
}

import { Badge, Tooltip } from "@mantine/core";
import { IconTextRecognition } from "@tabler/icons";

import {
  getTextForBreakdown,
  SdImage,
  SdImagePlaceHolder,
} from "../libs/shared-types/src";

type SdImageBadgeBarProps = {
  image: SdImage | SdImagePlaceHolder;
  onSetMainImage?: () => void;
  isMainImage?: boolean;

  shouldHidePrompt?: boolean;
};

export function SdImageBadgeBar(props: SdImageBadgeBarProps) {
  const { image, onSetMainImage, isMainImage, shouldHidePrompt } = props;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 200,
      }}
    >
      <Tooltip label="seed">
        <Badge>{image.seed}</Badge>
      </Tooltip>
      <Tooltip label="cfg">
        <Badge>{image.cfg}</Badge>
      </Tooltip>
      <Tooltip label="steps">
        <Badge>{image.steps}</Badge>
      </Tooltip>
      <Tooltip label="engine">
        <Badge color={image.engine === "DALL-E" ? "green" : "grape"}>
          {image.engine}
        </Badge>
      </Tooltip>
      {image.variantStrength && (
        <Tooltip label="strength">
          <Badge>{(1 - image.variantStrength).toPrecision(2)}</Badge>
        </Tooltip>
      )}
      {!shouldHidePrompt && (
        <Tooltip
          label={getTextForBreakdown(image.promptBreakdown)}
          width={400}
          color="blue"
          position="bottom"
          multiline
        >
          <Badge>
            <IconTextRecognition />
          </Badge>
        </Tooltip>
      )}
      {onSetMainImage && (
        <Badge
          color={isMainImage ? "green" : "blue"}
          onClick={() => onSetMainImage?.()}
        >
          main
        </Badge>
      )}
    </div>
  );
}

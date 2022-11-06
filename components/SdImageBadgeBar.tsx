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
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 200,
      }}
    >
      <Tooltip label="seed">
        <Badge>{props.image.seed}</Badge>
      </Tooltip>
      <Tooltip label="cfg">
        <Badge>{props.image.cfg}</Badge>
      </Tooltip>
      <Tooltip label="steps">
        <Badge>{props.image.steps}</Badge>
      </Tooltip>
      <Tooltip label="engine">
        <Badge color={props.image.engine === "DALL-E" ? "green" : "grape"}>
          {props.image.engine}
        </Badge>
      </Tooltip>
      {props.image.variantStrength && (
        <Tooltip label="strength">
          <Badge>{(1 - props.image.variantStrength).toPrecision(2)}</Badge>
        </Tooltip>
      )}
      {!props.shouldHidePrompt && (
        <Tooltip
          label={getTextForBreakdown(props.image.promptBreakdown)}
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
      {props.onSetMainImage && (
        <Badge
          color={props.isMainImage ? "green" : "blue"}
          onClick={() => props.onSetMainImage?.()}
        >
          main
        </Badge>
      )}
    </div>
  );
}

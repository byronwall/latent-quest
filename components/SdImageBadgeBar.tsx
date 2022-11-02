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

import { Loader } from "@mantine/core";
import { IconWand } from "@tabler/icons";
import { useContext, useState } from "react";
import { useQueryClient } from "react-query";

import { Button } from "./Button";
import { TooltipCommon } from "./MantineWrappers";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdGroupContext } from "./SdGroupContext";
import { SdImageComp } from "./SdImageComp";

import { getTextForBreakdown } from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";
import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImageOrPlaceholderCommonProps } from "./SdImageComp";
import type { SdImagePlaceHolder } from "../libs/shared-types/src";

export type SdImagePlaceHolderCompProps = SdImageOrPlaceholderCommonProps & {
  placeholder: SdImagePlaceHolder;
};

export function SdImagePlaceHolderComp(props: SdImagePlaceHolderCompProps) {
  const { placeholder, size } = props;

  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleClick = async () => {
    setIsLoading(true);
    await api_generateImage(placeholder);
    setIsLoading(false);

    console.log("invalidate queries");

    await queryClient.invalidateQueries();
  };

  const placeholderId = getUniversalIdFromImage(placeholder);

  const groupDataContext = useContext(SdGroupContext);
  const existingImage = groupDataContext.groupImages[placeholderId];

  if (existingImage) {
    return <SdImageComp image={existingImage} size={size} />;
  }

  const promptText = getTextForBreakdown(placeholder.promptBreakdown);

  return (
    <div
      style={{
        maxWidth: size,
        minHeight: size,
        backgroundColor: "lightgray",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", paddingTop: 4 }}>
        <div>
          {isLoading && <Loader />}
          {!isLoading && (
            <div>
              <Button onClick={handleClick}>
                <IconWand />
              </Button>
            </div>
          )}
        </div>
        <SdImageBadgeBar image={placeholder} shouldHidePrompt />
      </div>
      <TooltipCommon label={promptText} openDelay={500}>
        <div>
          <p className="prompt-clip">
            {'"'}
            {promptText}
            {'"'}
          </p>
        </div>
      </TooltipCommon>
    </div>
  );
}

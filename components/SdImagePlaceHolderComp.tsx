import { Loader } from "@mantine/core";
import { IconWand } from "@tabler/icons";
import { useContext, useState } from "react";
import { useQueryClient } from "react-query";
import { useUpdateEffect } from "react-use";

import { Button } from "./Button";
import { TooltipCommon } from "./MantineWrappers";
import { SdGroupContext } from "./SdGroupContext";
import { SdImageBadgeBar } from "./SdImageBadgeBar";
import { SdImageComp } from "./SdImageComp";

import { useAppStore } from "../model/store";
import { getTextForBreakdown } from "../libs/shared-types/src";
import { getUniversalIdFromImage } from "../libs/helpers";

import type { SdImageOrPlaceholderCommonProps } from "./SdImageComp";
import type { SdImagePlaceHolder } from "../libs/shared-types/src";

export type SdImagePlaceHolderCompProps = SdImageOrPlaceholderCommonProps & {
  placeholder: SdImagePlaceHolder;

  defaultIsLoading?: boolean;
};

export function SdImagePlaceHolderComp(props: SdImagePlaceHolderCompProps) {
  const { placeholder, size, defaultIsLoading } = props;

  const pendingImages = useAppStore((s) => s.pendingImages);
  const createImageRequest = useAppStore((s) => s.createImageRequest);

  const knownIsLoading = pendingImages.some(
    (item) => item.id === placeholder.id
  );

  const [isLoading, setIsLoading] = useState(
    defaultIsLoading ?? knownIsLoading ?? false
  );

  useUpdateEffect(() => {
    setIsLoading(defaultIsLoading ?? false);
  }, [defaultIsLoading]);

  const queryClient = useQueryClient();

  const handleClick = async () => {
    setIsLoading(true);
    await createImageRequest(placeholder);
    setIsLoading(false);

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
      className="h-full w-full"
      style={{
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

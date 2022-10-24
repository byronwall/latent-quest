import { Button, Loader } from "@mantine/core";
import { useState } from "react";
import { useQueryClient } from "react-query";

import {
  getTextForBreakdown,
  SdImagePlaceHolder,
} from "../libs/shared-types/src";
import { api_generateImage } from "../model/api";

type SdImagePlaceHolderCompProps = {
  size: number;
  placeholder: SdImagePlaceHolder;
};

export function SdImagePlaceHolderComp(props: SdImagePlaceHolderCompProps) {
  // des props
  const { placeholder, size } = props;

  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const handleClick = async () => {
    console.log("handleClick - gen image", placeholder);
    setIsLoading(true);
    await api_generateImage(placeholder);
    setIsLoading(false);

    queryClient.invalidateQueries();
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: "lightgray",
      }}
    >
      {isLoading && <Loader />}
      {!isLoading && (
        <div>
          <Button onClick={handleClick}>gen</Button>
        </div>
      )}

      <p>seed = {placeholder.seed} </p>
      <p>cfg = {placeholder.cfg}</p>
      <p>steps = {placeholder.steps}</p>
      <p>prompt = {getTextForBreakdown(placeholder.promptBreakdown)}</p>
    </div>
  );
}

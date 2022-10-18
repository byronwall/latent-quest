import { v4 as uuidv4 } from "uuid";

export function sharedTypes(): string {
  return "shared-types";
}

export interface SdImage {
  id: string;

  seed: number;
  cfg: number;
  steps: number;
  url: string;
  dateCreated: string;

  groupId: string;

  promptBreakdown: PromptBreakdown;
}

export type SdImagePlaceHolder = Partial<
  Omit<SdImage, "id" | "dateCreated" | "url">
> &
  Pick<SdImage, "promptBreakdown">;

export type ImageGenRequest = SdImagePlaceHolder;

export interface ImageGenResponse {
  imageUrl: string;
  groupId: string;
}

export function getUuid() {
  return uuidv4();
}

export interface PromptPart {
  text: string;
  label: BreakdownType;
}

export type BreakdownType = typeof PromptBreakdownSortOrder[number];

export interface PromptBreakdown {
  parts: PromptPart[];
}

export const PromptBreakdownSortOrder = ["unknown"] as const;

export function getTextForBreakdown(breakdown: PromptBreakdown | undefined) {
  if (breakdown === undefined) {
    return "";
  }

  // sort based on type
  const sortedParts = [...breakdown.parts].sort((a, b) => {
    return (
      PromptBreakdownSortOrder.indexOf(a.label) -
      PromptBreakdownSortOrder.indexOf(b.label)
    );
  });
  return sortedParts.map((c) => c.text).join(", ");
}

export function getBreakdownForText(text: string): PromptBreakdown {
  const parts = text.split(",").map((c) => c.trim());
  const breakdown: PromptBreakdown = {
    parts: parts.map((c) => {
      return {
        text: c,
        label: "unknown",
      };
    }),
  };
  return breakdown;
}

export interface SdImageTransformNumberRaw {
  type: "num-raw";
  field: "seed" | "cfg" | "steps";
  value: number;
}

export interface SdImageTransformNumberDelta {
  type: "num-delta";
  field: "seed" | "cfg" | "steps";
  delta: number;
}

export interface SdImageTransformText {
  type: "text";
  field: BreakdownType;
  action: "add" | "remove" | "set";
  value: string | string[];
}

export interface SdImageTransformMulti {
  type: "multi";
  transforms: SdImageTransform[];
}

export interface SdImageTransformNone {
  type: "none";
}

export const TransformNone: SdImageTransformNone = {
  type: "none",
} as const;

export type SdImageTransformNonMulti =
  | SdImageTransformNumberRaw
  | SdImageTransformNumberDelta
  | SdImageTransformText
  | SdImageTransformNone;

export type SdImageTransform = SdImageTransformNonMulti | SdImageTransformMulti;

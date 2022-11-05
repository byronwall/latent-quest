import { v4 as uuidv4 } from "uuid";

export function sharedTypes(): string {
  return "shared-types";
}

export type SdImageEngines = "DALL-E" | "SD 1.5";

export interface SdImage {
  id: string;

  seed: number;
  cfg: number;
  steps: number;
  url: string;
  dateCreated: string;

  groupId: string;

  engine: SdImageEngines;

  // fields for generate variations
  // source id will be used to load image behind the scenes
  variantSourceId?: string;
  variantStrength?: number;

  // add a source URL later for random internet images

  promptBreakdown: PromptBreakdown;
}

export function getValidEngine(engine: string): SdImageEngines {
  return engine === "DALL-E" ? "DALL-E" : "SD 1.5";
}

export interface SdImageGroup {
  id: string;
  created_at: any;
  view_settings: SdGroupViewSettings;
}

export interface SdGroupViewSettings {
  name: string;
  notes: string;
  defaultView: SdGroupView;
}

export interface SdGroupView {
  rowVar: string;
  colVar: string;

  isSingleVar?: boolean;

  mainImageId?: string;

  // store check mark choices for subs
  specialChoicesCheckAll?: { [key: string]: boolean };
  specialChoicesCheckPopup?: { [key: string]: boolean };

  // add in those extra choices
}

export type SdImagePlaceHolder = Partial<
  Omit<SdImage, "id" | "dateCreated" | "url">
> &
  Pick<SdImage, "promptBreakdown" | "engine">;

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

export interface PromptSelection {
  name: string;
  originalText: string;
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
  const result = sortedParts.map((c) => c.text).join(", ");
  return result;
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

export interface SdImageTransformHolder {
  name: string;
  transforms: SdImageTransform[];
}

type COMMON_FIELDS = "seed" | "cfg" | "steps";

type TEXT_PROP_FIELDS = "engine";

export interface SdImageTransformNumberRaw {
  type: "num-raw";
  field: COMMON_FIELDS;
  value: number;
}

export interface SdImageTransformSetTextProp {
  type: "set-text-prop";
  field: TEXT_PROP_FIELDS;
  value: string;
}

export interface SdImageTransformNumberDelta {
  type: "num-delta";
  field: COMMON_FIELDS;
  delta: number;
}

export type SdImageTransformText =
  | SdImageTransformTextBasic
  | SdImageTransformTextSub;

export interface SdImageTransformTextBasic {
  type: "text";
  field: BreakdownType;
  action: "add" | "remove" | "set";
  value: string | string[];

  index?: number;
}

export interface SdImageTransformTextSub {
  type: "text";
  field: BreakdownType;

  action: "substitute";

  value: string;

  index?: number;
}

export interface SdImageTransformMulti {
  type: "multi";
  transforms: SdImageTransform[];
  field: BreakdownType | "various" | COMMON_FIELDS | "none" | TEXT_PROP_FIELDS;
}
export interface SdImageTransformNone {
  type: "none";
  field: "none";
}

export const TransformNone: SdImageTransformNone = {
  type: "none",
  field: "none",
} as const;

export type SdImageTransformNonMulti =
  | SdImageTransformNumberRaw
  | SdImageTransformNumberDelta
  | SdImageTransformText
  | SdImageTransformNone
  | SdImageTransformSetTextProp;

export type SdImageTransform = SdImageTransformNonMulti | SdImageTransformMulti;

export function createDefaultViewSettings(): SdGroupViewSettings {
  return {
    name: "",
    notes: "",
    defaultView: {
      rowVar: "cfg",
      colVar: "seed",
    },
  };
}

export type SdSubChoice =
  | {
      id: number;
      category: string;
      value: string;
      tags: string[];
    }
  | {
      category: string;
      value: string;
      tags: string[];
    };

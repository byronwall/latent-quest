import { SdImageTransform } from "../libs/shared-types/src";

export interface ImageTransformHolder {
  name: string;
  transforms: SdImageTransform[];
}
export const transforms: ImageTransformHolder[] = [
  {
    name: "Surreal",
    transforms: [
      {
        type: "text",
        action: "set",
        field: "artist",
        value: "by Vincent Van Gogh",
      },
      {
        type: "text",
        action: "set",
        field: "artist",
        value: "by Claude Monet",
      },
    ],
  },
  {
    name: "Step CFG",
    transforms: [
      {
        type: "num-raw",
        field: "cfg",
        value: 8,
      },
      {
        type: "num-raw",
        field: "cfg",
        value: 10,
      },
      {
        type: "num-raw",
        field: "cfg",
        value: 12,
      },
    ],
  },
];

import { SdImageTransformHolder } from "../libs/shared-types/src";

export const transforms: SdImageTransformHolder[] = [
  {
    name: "Surreal",
    transforms: [
      {
        type: "text",
        action: "set",
        field: "unknown",
        value: "by Vincent Van Gogh",
      },
      {
        type: "text",
        action: "set",
        field: "unknown",
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

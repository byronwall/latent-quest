import { generatePlaceholderForTransform } from "../../../helpers";
import {
  SdImage,
  SdImageTransformNumberDelta,
  SdImageTransformNumberRaw,
  SdImageTransformText,
  sharedTypes,
} from "./shared-types";

const getBaseImage = (): SdImage => {
  const image: SdImage = {
    id: "123",
    seed: 123,
    cfg: 10,
    steps: 20,
    url: "123",
    dateCreated: "123",
    groupId: "123",
    engine: "SD 1.5",
    promptBreakdown: {
      parts: [
        {
          text: "initial",
          label: "unknown",
        },
        { label: "unknown", text: "truck" },
      ],
    },
  };
  return image;
};

describe("sharedTypes", () => {
  it("should work", () => {
    expect(sharedTypes()).toEqual("shared-types");
  });

  it("should modify an image -- add text", () => {
    const image = getBaseImage();

    const xForm: SdImageTransformText = {
      action: "add",
      field: "unknown",
      type: "text",
      value: "dummy",
    };

    const modifiedImage = generatePlaceholderForTransform(image, xForm);

    expect(modifiedImage.promptBreakdown.parts).toEqual([
      { text: "initial", label: "artist" },
      { label: "main", text: "truck" },
      { text: "dummy", label: "artist" },
    ]);
  });
  it("should modify an image -- remove text", () => {
    const image = getBaseImage();

    const xForm: SdImageTransformText = {
      type: "text",
      action: "remove",
      field: "unknown",
      value: "initial",
    };

    const modifiedImage = generatePlaceholderForTransform(image, xForm);

    expect(modifiedImage.promptBreakdown.parts).toEqual([
      { label: "main", text: "truck" },
    ]);
  });
  it("should modify an image -- set text", () => {
    const image = getBaseImage();

    const xForm: SdImageTransformText = {
      type: "text",
      action: "set",
      field: "unknown",
      value: "dummy",
    };

    const modifiedImage = generatePlaceholderForTransform(image, xForm);

    expect(modifiedImage.promptBreakdown.parts).toEqual([
      { label: "main", text: "truck" },
      { text: "dummy", label: "artist" },
    ]);
  });
  it("should modify an image -- set cfg text", () => {
    const image = getBaseImage();

    const xForm: SdImageTransformNumberRaw = {
      type: "num-raw",
      field: "cfg",
      value: 11,
    };

    const modifiedImage = generatePlaceholderForTransform(image, xForm);

    expect(modifiedImage.cfg).toEqual(11);
  });
  it("should modify an image -- delta cfg text", () => {
    const image = getBaseImage();

    const xForm: SdImageTransformNumberDelta = {
      type: "num-delta",
      field: "cfg",
      delta: 2,
    };

    const modifiedImage = generatePlaceholderForTransform(image, xForm);

    expect(modifiedImage.cfg).toEqual(12);
  });
});

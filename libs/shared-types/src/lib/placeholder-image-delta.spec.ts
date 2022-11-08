import { SdImage, SdImagePlaceHolder } from "./shared-types";

import { isImageSameAsPlaceHolder } from "../../../helpers";

const placeholder: SdImagePlaceHolder = {
  groupId: "5a83069f-2ce1-4ba5-8014-3efe687be13d",
  engine: "SD 1.5",
  promptBreakdown: {
    parts: [
      {
        text: "cover of a astronaut",
        label: "unknown",
      },
      {
        text: "cloudy sky background",
        label: "unknown",
      },
      {
        text: "lush landscape",
        label: "unknown",
      },
      {
        text: "illustration concept art",
        label: "unknown",
      },
      {
        text: "anime",
        label: "unknown",
      },
      {
        text: "key visual",
        label: "unknown",
      },
      {
        text: "trending pixiv",
        label: "unknown",
      },
      {
        text: "fanbox",
        label: "unknown",
      },
      {
        text: "by ilya kuvshinov",
        label: "unknown",
      },
      {
        text: "by greg rutkowski",
        label: "unknown",
      },
      {
        text: "by victo ngai",
        label: "unknown",
      },
      {
        text: "makoto shinkai",
        label: "unknown",
      },
      {
        text: "takashi takeuchi",
        label: "unknown",
      },
      {
        text: "studio ghibli",
        label: "unknown",
      },
    ],
  },
  seed: 444,
  cfg: 10,
  steps: 20,
};

const image: SdImage = {
  id: "52e4c2e5-576f-40c8-895e-69762878f82c",
  groupId: "5a83069f-2ce1-4ba5-8014-3efe687be13d",
  engine: "SD 1.5",
  promptBreakdown: {
    parts: [
      {
        text: "cover of a astronaut",
        label: "unknown",
      },
      {
        text: "cloudy sky background",
        label: "unknown",
      },
      {
        text: "lush landscape",
        label: "unknown",
      },
      {
        text: "by ilya kuvshinov",
        label: "unknown",
      },
      {
        text: "by greg rutkowski",
        label: "unknown",
      },
      {
        text: "by victo ngai",
        label: "unknown",
      },
      {
        text: "makoto shinkai",
        label: "unknown",
      },
      {
        text: "takashi takeuchi",
        label: "unknown",
      },
      {
        text: "studio ghibli",
        label: "unknown",
      },
      {
        text: "illustration concept art",
        label: "unknown",
      },
      {
        text: "anime",
        label: "unknown",
      },
      {
        text: "key visual",
        label: "unknown",
      },
      {
        text: "trending pixiv",
        label: "unknown",
      },
      {
        text: "fanbox",
        label: "unknown",
      },
    ],
  },
  seed: 444,
  cfg: 10,
  url: "generation-a75be1ab-1a00-4874-b855-656e129ddb7f:0-1c76c09f-5c19-4c70-82b1-c3c147c1adaa-0.png",
  dateCreated: "2022-10-03T03:15:39.768Z",
  steps: 20,
};

describe("PlaceholderImageDelta", () => {
  it("should find a difference", () => {
    const isSame = isImageSameAsPlaceHolder(image, placeholder);
    expect(isSame).toBe(true);
  });
});

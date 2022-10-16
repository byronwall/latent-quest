import {
  isImageSameAsPlaceHolder,
  SdImage,
  SdImagePlaceHolder,
} from './shared-types';

const placeholder: SdImagePlaceHolder = {
  groupId: '5a83069f-2ce1-4ba5-8014-3efe687be13d',
  promptBreakdown: {
    parts: [
      {
        text: 'cover of a astronaut',
        label: 'main',
      },
      {
        text: 'cloudy sky background',
        label: 'modifiers',
      },
      {
        text: 'lush landscape',
        label: 'modifiers',
      },
      {
        text: 'illustration concept art',
        label: 'style',
      },
      {
        text: 'anime',
        label: 'style',
      },
      {
        text: 'key visual',
        label: 'style',
      },
      {
        text: 'trending pixiv',
        label: 'makeItGood',
      },
      {
        text: 'fanbox',
        label: 'makeItGood',
      },
      {
        text: 'by ilya kuvshinov',
        label: 'artist',
      },
      {
        text: 'by greg rutkowski',
        label: 'artist',
      },
      {
        text: 'by victo ngai',
        label: 'artist',
      },
      {
        text: 'makoto shinkai',
        label: 'artist',
      },
      {
        text: 'takashi takeuchi',
        label: 'artist',
      },
      {
        text: 'studio ghibli',
        label: 'artist',
      },
    ],
  },
  seed: 444,
  cfg: 10,
  steps: 20,
};

const image: SdImage = {
  id: '52e4c2e5-576f-40c8-895e-69762878f82c',
  groupId: '5a83069f-2ce1-4ba5-8014-3efe687be13d',
  promptBreakdown: {
    parts: [
      {
        text: 'cover of a astronaut',
        label: 'main',
      },
      {
        text: 'cloudy sky background',
        label: 'modifiers',
      },
      {
        text: 'lush landscape',
        label: 'modifiers',
      },
      {
        text: 'by ilya kuvshinov',
        label: 'artist',
      },
      {
        text: 'by greg rutkowski',
        label: 'artist',
      },
      {
        text: 'by victo ngai',
        label: 'artist',
      },
      {
        text: 'makoto shinkai',
        label: 'artist',
      },
      {
        text: 'takashi takeuchi',
        label: 'artist',
      },
      {
        text: 'studio ghibli',
        label: 'artist',
      },
      {
        text: 'illustration concept art',
        label: 'style',
      },
      {
        text: 'anime',
        label: 'style',
      },
      {
        text: 'key visual',
        label: 'style',
      },
      {
        text: 'trending pixiv',
        label: 'makeItGood',
      },
      {
        text: 'fanbox',
        label: 'makeItGood',
      },
    ],
  },
  seed: 444,
  cfg: 10,
  url: 'generation-a75be1ab-1a00-4874-b855-656e129ddb7f:0-1c76c09f-5c19-4c70-82b1-c3c147c1adaa-0.png',
  dateCreated: '2022-10-03T03:15:39.768Z',
  steps: 20,
};

describe('PlaceholderImageDelta', () => {
  it('should find a difference', () => {
    const isSame = isImageSameAsPlaceHolder(image, placeholder);
    expect(isSame).toBe(true);
  });
});

import { findImageDifferences, SdImage } from './shared-types';

const image1: SdImage = {
  id: '002e81b0-cf5f-41c5-8664-08f7d9cbef2b',
  groupId: '0cf59f1f-3582-41d3-8640-c7f7e754c637',
  promptBreakdown: {
    parts: [
      {
        text: 'dump truck',
        label: 'unknown',
      },
      {
        text: 'synthwave',
        label: 'unknown',
      },
      {
        text: 'water smoke',
        label: 'unknown',
      },
      {
        text: 'shattering acrylic',
        label: 'unknown',
      },
      {
        text: 'by peter mohrbacher',
        label: 'unknown',
      },
      {
        text: 'artgerm',
        label: 'unknown',
      },
      {
        text: 'geometric watercolor',
        label: 'unknown',
      },
      {
        text: 'bright colors',
        label: 'unknown',
      },
    ],
  },
  seed: 8975,
  cfg: 7,
  url: 'generation-66fe884a-eeea-48ff-8ae8-c496628b29f5:0-ad1661ef-743b-424a-88b3-6a40e6c79bcb-0.png',
  dateCreated: '2022-10-03T03:31:26.381Z',
  steps: 20,
};

const image2: SdImage = {
  id: '543410dd-05c0-4226-8692-ee761800ee03',
  groupId: '0cf59f1f-3582-41d3-8640-c7f7e754c637',
  promptBreakdown: {
    parts: [
      {
        text: 'dump truck',
        label: 'unknown',
      },
      {
        text: 'synthwave',
        label: 'unknown',
      },
      {
        text: 'water smoke',
        label: 'unknown',
      },
      {
        text: 'shattering acrylic',
        label: 'unknown',
      },
      {
        text: 'by peter mohrbacher',
        label: 'unknown',
      },
      {
        text: 'artgerm',
        label: 'unknown',
      },
      {
        text: 'geometric watercolor',
        label: 'unknown',
      },
      {
        text: 'bright colors',
        label: 'unknown',
      },
      {
        text: 'by Vincent Van Gogh',
        label: 'artist',
      },
    ],
  },
  seed: 8975,
  cfg: 12,
  url: 'generation-da3facb6-3fee-4c6b-995d-3fcf74bc1385:0-62e0907a-c490-418f-a573-74c8ee0bae04-0.png',
  dateCreated: '2022-10-03T03:48:33.661Z',
  steps: 20,
};

describe('sharedTypes', () => {
  it('should find differences', () => {
    const diffs = findImageDifferences(image1, image2);

    expect(diffs).toEqual([
      {
        type: 'num-raw',
        field: 'cfg',
        value: 12,
      },
      {
        type: 'text',
        field: 'artist',
        action: 'add',
        value: ['by Vincent Van Gogh'],
      },
    ]);
  });
});

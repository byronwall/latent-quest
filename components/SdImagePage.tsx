import { SdImageComp } from "./SdImageComp";

import type { SdImage } from "../libs/shared-types/src";

export type SdImagePageProps = {
  initialImage: SdImage;
};
export function SdImagePage(props: SdImagePageProps) {
  const { initialImage } = props;
  return (
    <div className="mx-auto mt-8 w-96">
      <SdImageComp image={initialImage} size={512} shouldShowDetails />
    </div>
  );
}

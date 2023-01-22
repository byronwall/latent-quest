import { useState } from "react";

import { InspirationMgr } from "../components/InspirationMgr";
import { SdNewImagePrompt } from "../components/SdNewImagePrompt";
import { SimpleLayout } from "../components/SimpleLayout";

import type { InspirationEntry } from "../components/InspirationMgr";

export default function CreatePrompt() {
  const [inspirationToAdd, setInspirationToAdd] = useState<
    InspirationEntry | undefined
  >(undefined);

  return (
    <div className="mb-10">
      <SimpleLayout
        title="create"
        description="Use the controls to create a new image. This will also create a new
      group to hold the results."
        rightChild={<SdNewImagePrompt inspirationToAdd={inspirationToAdd} />}
      />
      <InspirationMgr
        onAddInspiration={(inspiration) => {
          setInspirationToAdd(inspiration);
        }}
      />
    </div>
  );
}

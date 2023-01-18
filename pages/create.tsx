import { SdNewImagePrompt } from "../components/SdNewImagePrompt";
import { SimpleLayout } from "../components/SimpleLayout";

export default function CreatePrompt() {
  return (
    <SimpleLayout
      title="create"
      description="Use the controls to create a new image. This will also create a new
    group to hold the results."
      rightChild={<SdNewImagePrompt shouldShowLoaderAfterCreate />}
    />
  );
}

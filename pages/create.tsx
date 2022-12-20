import { SdNewImagePrompt } from "../components/SdNewImagePrompt";

export default function CreatePrompt() {
  return (
    <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex w-40 shrink-0 flex-col gap-2">
        <h1 className="text-3xl"> new image</h1>
        <p>
          Use the controls to create a new image. This will also create a new
          group to hold the results.
        </p>
      </div>
      <SdNewImagePrompt />
    </div>
  );
}

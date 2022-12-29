import { SdNewImagePrompt } from "../components/SdNewImagePrompt";

export default function CreatePrompt() {
  return (
    <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
      <div className="flex shrink-0 flex-col gap-2 p-4 ">
        <h1 className="text-3xl"> new image</h1>
        <p>
          Use the controls to create a new image. This will also create a new
          group to hold the results.
        </p>
      </div>
      <div className="p-4 md:col-span-2">
        <SdNewImagePrompt />
      </div>
    </div>
  );
}

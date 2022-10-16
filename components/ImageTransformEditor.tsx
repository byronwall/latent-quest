import { SdImageTransform } from "../libs/shared-types/src";
import { ImageTransformNumberEditor } from "./ImageTransformNumberEditor";
import { ImageTransformTextEditor } from "./ImageTransformTextEditor";

export interface ImageTransformEditorProps<T> {
  transform: T;

  onChange: (transform: T) => void;
}

export function ImageTransformEditor(
  props: ImageTransformEditorProps<SdImageTransform>
) {
  //des props
  const { transform, onChange } = props;
  switch (transform.type) {
    case "num-raw":
      return (
        <ImageTransformNumberEditor transform={transform} onChange={onChange} />
      );
    case "num-delta":
      return (
        <ImageTransformNumberEditor transform={transform} onChange={onChange} />
      );
    case "text":
      return (
        <ImageTransformTextEditor transform={transform} onChange={onChange} />
      );
  }
}

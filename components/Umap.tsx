import { useMemo, useState } from "react";

import {
  ScatterplotWithBrushAndZoom,
  ScatterPoint,
} from "./Scatter/ScatterPlotWithBrushAndZoom";
import { SdImageComp } from "./SdImageComp";

import type { SdImage } from "../libs/shared-types/src";

export type UmapProps = {
  images: SdImage[];
};

export function Umap(props: UmapProps) {
  const { images } = props;

  const data = useMemo(
    () => images.map((image, i) => ({ x: i, y: i, id: i, image })),
    [images]
  );

  const [brushedPoints, setBrushedPoints] = useState(data);

  return (
    <div>
      <h1>Umap</h1>
      <div>
        <ScatterplotWithBrushAndZoom
          data={data}
          width={300}
          height={300}
          mode={"brush"}
          color="#cc0"
          onBrushedPoints={setBrushedPoints}
        />
      </div>
      <div className="grid grid-cols-4">
        {brushedPoints.map((c) => (
          <div key={c.image.id}>
            <SdImageComp image={c.image} size={512} />
          </div>
        ))}
      </div>
    </div>
  );
}

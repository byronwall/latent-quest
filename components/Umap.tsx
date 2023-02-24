import { useEffect, useState } from "react";
import { UMAP } from "umap-js";

import { Button } from "./Button";
import { ScatterplotWithBrushAndZoom } from "./Scatter/ScatterPlotWithBrushAndZoom";
import { SdImageComp } from "./SdImageComp";

import type { ScatterPoint } from "./Scatter/ScatterPlotWithBrushAndZoom";
import type { SdImage } from "../libs/shared-types/src";

export type UmapProps = {
  images: SdImage[];
};

interface UmapPoint extends ScatterPoint {
  image: SdImage;
}

export function Umap(props: UmapProps) {
  const { images } = props;

  const initialData: UmapPoint[] = images.map((image, i) => ({
    x: image.embedding?.[0] ?? 0,
    y: image.embedding?.[1] ?? 0,
    id: i,
    image,
  }));

  const [data, setData] = useState(initialData);

  const [brushedPoints, setBrushedPoints] = useState<UmapPoint[]>(data);

  const [hoverPoint, setHoverPoint] = useState<UmapPoint | null>(null);

  return (
    <div>
      <h1>Umap ({images.length})</h1>

      <div className="flex gap-4 p-8">
        <ScatterplotWithBrushAndZoom<UmapPoint>
          data={data}
          width={600}
          height={400}
          mode={"brush"}
          color="#cc0"
          onBrushedPoints={setBrushedPoints}
          onHoverPoint={setHoverPoint}
        />

        {hoverPoint && (
          <div>
            <SdImageComp image={hoverPoint.image} size={384} />
          </div>
        )}
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

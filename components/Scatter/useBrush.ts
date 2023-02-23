import { brushSelection, brush } from "d3-brush";
import { select } from "d3-selection";
import { useEffect, useRef } from "react";

import type { RefObject } from "react";

type useBrushProps = {
  ref: RefObject<SVGGElement>;
  xScale: any;
  yScale: any;
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  innerWidth: number;
  height: number;
  innerHeight: number;
  intervalBounds: [number, number];
  onChangeBrushedInterval: (interval: number[][] | undefined) => void;
  brushedInterval: [number, number] | undefined;
  hideBrushOnEnd?: boolean;
};

export const useBrush = ({
  ref,
  xScale,
  yScale,
  margin,
  innerWidth,
  height,
  innerHeight,
  intervalBounds,
  onChangeBrushedInterval,
  brushedInterval,
  hideBrushOnEnd,
}: useBrushProps) => {
  // BRUSH ------
  // keep a ref of brushed xScale so we can use it in the brush callbacks
  const xScaleRef = useRef(xScale);
  const yScaleRef = useRef(yScale);
  useEffect(() => {
    xScaleRef.current = xScale;
    yScaleRef.current = yScale;
  }, [xScale, yScale]);

  // set to true for next update to not trigger the onChange callback
  // needed for when calling brush.move programmatically
  const silentUpdateRef = useRef(false);
  const brushInstanceRef = useRef<typeof brush | null>(null);
  // attach brush
  useEffect(() => {
    const brushInstance = brush()
      .on("start", handleBrushStart)
      .on("brush", handleBrush)
      .on("end", handleBrushEnd)
      .extent([
        [margin.left, margin.top],
        [margin.left + innerWidth, margin.top + innerHeight],
      ]);
    brushInstanceRef.current = brushInstance;
    function handleBrushStart() {
      select(this).classed("dragging", true);
      // for brushX:
      // select(this)
      //   .select(".selection")
      //   .attr("height", innerHeight)
      //   .attr("y", margin.top);
      select(this)
        .selectAll(".selection,.handle")
        .style("opacity", 1)
        .style("display", "");
    }
    // can override some brushing behavior here
    // e.g. snap it to top and bottom
    function handleBrush() {
      // select(this).select(".selection");
      // NOTE: could have a callback here to get intermediate updates.
    }
    function handleBrushEnd() {
      if (silentUpdateRef.current) {
        silentUpdateRef.current = false;
        return;
      }
      select(this).classed("dragging", false);
      const brushBounds = brushSelection(this);
      if (!brushBounds) {
        onChangeBrushedInterval(undefined);
        return;
      }

      // don't allow brushes less than 3px in width, they count as clicks
      const MIN_BRUSH_SIZE = 3;
      const brushSize = Math.sqrt(
        Math.pow(brushBounds[0][0] - brushBounds[1][0], 2) +
          Math.pow(brushBounds[0][1] - brushBounds[1][1], 2)
      );
      if (brushSize < MIN_BRUSH_SIZE) {
        // ignore, brush too small
        select(this).call(brushInstanceRef.current.clear);
        onChangeBrushedInterval(undefined);
        return;
      }

      // note: you can modify the brush bounds here to make sure it fits the constraints
      // you want.

      const newBrushedInterval = [
        [
          xScaleRef.current.invert(brushBounds[0][0] - margin.left),
          yScaleRef.current.invert(brushBounds[0][1] - margin.top),
        ],
        [
          xScaleRef.current.invert(brushBounds[1][0] - margin.left),
          yScaleRef.current.invert(brushBounds[1][1] - margin.top),
        ],
      ];
      onChangeBrushedInterval(newBrushedInterval);

      if (hideBrushOnEnd) {
        select(this)
          .selectAll(".handle")
          .transition()
          .duration(300)
          .style("opacity", 0)
          .on("end", function () {
            select(this).style("display", "none");
          });
        select(this)
          .select(".selection")
          .transition()
          .duration(300)
          .attr("x", margin.left)
          .attr("width", innerWidth)
          .style("opacity", 0)
          .on("end", function () {
            select(this).style("display", "none");
          });
      }
    }
    // initialize the brush
    select(ref.current)
      .call(brushInstance)
      .classed("d3-brush", true)
      .select(".selection");
    // for brushX snap to top:
    // .attr("height", innerHeight)
    // .attr("y", margin.top);
  }, [
    height,
    margin.left,
    margin.top,
    innerHeight,
    innerWidth,
    hideBrushOnEnd,
    intervalBounds,
    onChangeBrushedInterval,
    ref,
  ]);
  useEffect(() => {
    // initialize the interval if available
    if (brushInstanceRef.current) {
      silentUpdateRef.current = true;
      select(ref.current).call(
        brushInstanceRef.current.move,
        brushedInterval
          ? [
              [
                xScale(brushedInterval[0][0]) + margin.left,
                yScale(brushedInterval[0][1]) + margin.top,
              ],
              [
                xScale(brushedInterval[1][0]) + margin.left,
                yScale(brushedInterval[1][1]) + margin.top,
              ],
            ]
          : undefined
      );
    }
  }, [brushedInterval, ref, xScale, yScale, margin.top, margin.left]);
};
export default useBrush;

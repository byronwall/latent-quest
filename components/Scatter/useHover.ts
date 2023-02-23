import { minIndex } from "d3-array";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

export const useMouse = ({ ref, onChange, xOffset, yOffset }) => {
  const [hovering, setHovering] = useState(false);
  const [state, setState] = useState(undefined);
  const stateRef = useRef(state);

  // update at most per animation frame
  const raf = useRef(0);
  const handleChange = useCallback(
    (mouse) => {
      cancelAnimationFrame(raf.current);

      raf.current = requestAnimationFrame(() => {
        stateRef.current = mouse;
        onChange?.(mouse);
        setState(mouse);
      });
    },
    [onChange]
  );

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
    };
  });

  // turn on hovering flag when mouse over and off on mouseout
  useEffect(() => {
    const onMouseOver = () => setHovering(true);
    const onMouseOut = () => setHovering(false);

    const refNode = ref?.current;
    if (refNode) {
      refNode.addEventListener("mouseover", onMouseOver);
      refNode.addEventListener("mouseout", onMouseOut);
    }

    return () => {
      if (refNode) {
        refNode.removeEventListener("mouseover", onMouseOver);
        refNode.removeEventListener("mouseout", onMouseOut);
      }
    };
  }, [ref]);

  // check for mouse already over initially with mousemove (not caught by mouseover)
  useEffect(() => {
    const onMouseMove = () => setHovering(true);
    const refNode = ref?.current;
    // add if we don't think we are hovering in case we are
    if (refNode && !hovering) {
      refNode.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      // remove while hovering to prevent unnecessary callbacks
      if (refNode && !hovering) {
        refNode.removeEventListener("mousemove", onMouseMove);
      }
    };
  }, [ref, hovering]);

  // use document level mousemove to get reliable mouse events
  useEffect(() => {
    // clear old hovering state we missed from mouseout
    if (!hovering && stateRef.current !== undefined) {
      handleChange(undefined);
    }

    const moveHandler = (event) => {
      if (!ref?.current) {
        return;
      }
      const {
        left,
        top,
        width: elW,
        height: elH,
      } = ref.current.getBoundingClientRect();
      const posX = left + window.pageXOffset;
      const posY = top + window.pageYOffset;
      const x = event.pageX - posX;
      const y = event.pageY - posY;
      const isInsideRef = 0 <= x && x <= elW && 0 <= y && y <= elH;
      const nextState = isInsideRef
        ? { x: x - xOffset, y: y - yOffset }
        : undefined;

      handleChange(nextState);
    };

    if (hovering) {
      document.addEventListener("mousemove", moveHandler);
    }

    return () => {
      if (hovering) {
        document.removeEventListener("mousemove", moveHandler);
      }
    };
  }, [hovering, stateRef, ref, handleChange, xOffset, yOffset]);

  return state;
};

const defaultDatasetAccessor = (d) => d.dataset;

type useHoverProps = {
  ref: any;
  datasets: any[];
  datasetAccessor?: any;
  xScale: any;
  yScale: any;
  xAccessor: any;
  yAccessor: any;
  radius?: number;
  strategy?: "mouse" | "nearest";
  onChange?: any;
  xOffset?: number;
  yOffset?: number;
};

export function useHover({
  ref,
  datasets,
  datasetAccessor = defaultDatasetAccessor,
  xScale,
  yScale,
  xAccessor,
  yAccessor,
  radius = 100,
  strategy = "mouse",
  onChange,
  xOffset,
  yOffset,
}: useHoverProps) {
  const mouse = useMouse({
    ref,
    xOffset,
    yOffset,
    onChange: useCallback(
      (mouse) => {
        const result = processMouse({
          mouse,
          datasets,
          datasetAccessor,
          xScale,
          yScale,
          xAccessor,
          yAccessor,
          strategy,
          radius,
        });
        onChange?.(result);
      },
      [
        onChange,
        datasets,
        datasetAccessor,
        xScale,
        yScale,
        xAccessor,
        yAccessor,
        strategy,
        radius,
      ]
    ),
  });

  const result = useMemo(() => {
    return processMouse({
      mouse,
      datasets,
      datasetAccessor,
      xScale,
      yScale,
      xAccessor,
      yAccessor,
      strategy,
      radius,
    });
  }, [
    mouse,
    datasets,
    datasetAccessor,
    xScale,
    yScale,
    xAccessor,
    yAccessor,
    strategy,
    radius,
  ]);

  return result;
}

function processMouse({
  mouse,
  datasets,
  datasetAccessor,
  strategy,
  xScale,
  yScale,
  xAccessor,
  yAccessor,
  radius,
}) {
  if (!mouse) {
    return {};
  }

  // offset x to center if using a band scale
  // (treat the mouse as if it is half a bar to the left so the left edge acts as the center)
  let xOffset = 0;
  if (xScale.bandwidth) {
    xOffset = -xScale.bandwidth() / 2;
  }

  if (strategy === "nearest") {
    return {
      mouse,
      strategy,
      ...nearestPoints({
        x: mouse?.x == null ? undefined : mouse.x + xOffset,
        y: mouse?.y,
        xScale,
        yScale,
        radius,
        datasets,
        datasetAccessor,
        yAccessor,
        xAccessor,
      }),
    };
  } else {
    return {
      mouse,
      strategy,
      xValue: xScale?.invert?.(mouse.x),
      yValue: yScale?.invert?.(mouse.y),
    };
  }
}

const accessor = (a) => (typeof a === "function" ? a : (d) => d[a]);

export function findNearest(items, value, accessor) {
  return items?.length
    ? items[
        minIndex(items, (d, i, a) =>
          Math.abs(accessor(d, i, a).valueOf() - value.valueOf())
        )
      ]
    : undefined;
}

function nearestPoints({
  x,
  y,
  xScale,
  yScale,
  radius,
  datasets,
  datasetAccessor,
  yAccessor,
  xAccessor,
}) {
  if (x == null) {
    return {};
  }

  const xAccessorFn = accessor(xAccessor);
  const yAccessorFn = accessor(yAccessor);

  const distanceToMouse = (d) => {
    const dx = xScale(xAccessorFn(d));
    const dy = yScale(yAccessorFn(d));
    const distSq = (x - dx) * (x - dx) + (y - dy) * (y - dy);
    return distSq;
  };

  // find for each dataset, the value closest
  const nearestValues = datasets?.map((dataset) =>
    findNearest(datasetAccessor(dataset), 0, distanceToMouse)
  );

  // find the closest across all datasets
  let nearestDatum = findNearest(nearestValues, 0, distanceToMouse);

  const distance =
    nearestDatum == null ? undefined : Math.sqrt(distanceToMouse(nearestDatum));

  if (radius != null && (distance ?? 0) > radius) {
    nearestDatum = undefined;
  }

  if (nearestDatum == null) {
    return undefined;
  }

  const nearestDataset = datasets[nearestValues.indexOf(nearestDatum)];

  const points = [
    {
      dataset: nearestDataset,
      spec: nearestDataset.spec,
      d: nearestDatum,
    },
  ];

  return {
    xValue: xAccessorFn(nearestDatum),
    yValue: yAccessorFn(nearestDatum),
    x: xScale(xAccessorFn(nearestDatum)),
    y: yScale(yAccessorFn(nearestDatum)),
    points,
    distance,
  };
}

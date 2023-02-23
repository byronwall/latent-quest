import * as React from "react";
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";

type useZoomProps = {
  interactionRef: React.RefObject<SVGGElement>;
  onZoom: (transform: { x: number; y: number; k: number }) => void;
  width: number;
  height: number;
  onZooming?: (zooming: boolean) => void;
  enabled?: boolean;
};

// attach zoom & pan listener
export function useZoom({
  interactionRef,
  onZoom,
  width,
  height,
  onZooming,
  enabled = true,
}: useZoomProps) {
  const enabledRef = React.useRef(enabled);
  React.useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  React.useEffect(() => {
    let programmaticUpdate = false;
    const interactionRect = interactionRef.current;
    if (interactionRect == null) {
      return;
    }

    // position = [transform.x, transform.y];
    function handleZoomEvent() {
      if (programmaticUpdate) {
        return;
      }

      const transform = this.__zoom;
      onZoom(transform);
    }

    function handleZoomStartEvent(event) {
      if (onZooming) {
        onZooming(true);
      }
      if (programmaticUpdate) {
        return;
      }

      if (event.sourceEvent?.type === "mousedown") {
        interactionRef.current?.classList.add("zoom-enabled--active");
      }
    }

    function handleZoomEndEvent() {
      if (!programmaticUpdate) {
        interactionRef.current?.classList.remove("zoom-enabled--active");
      }
      if (onZooming) {
        onZooming(false);
      }
    }

    function syncTransform(newTransform) {
      // convert to full on transform object
      const transformObj = zoomIdentity
        .translate(newTransform.x, newTransform.y)
        .scale(newTransform.k);

      programmaticUpdate = true;
      select(interactionRect).call(zoomHandler.transform, transformObj);
      programmaticUpdate = false;

      return transformObj;
    }

    const zoomHandler = zoom()
      .scaleExtent([1, 48])
      .translateExtent([
        [0, 0],
        [width, height],
        // [-width * 0.5, -height * 0.5],
        // [width * 1.5, height * 1.5],
      ])
      .on("zoom", handleZoomEvent)
      .on("start", handleZoomStartEvent)
      .on("end", handleZoomEndEvent);

    select(interactionRect).call(zoomHandler);

    const originalHandleZoomMousedown =
      select(interactionRect).on("mousedown.zoom");
    function handleZoomMousedownEvent(event) {
      // only allow panning if we have enabled it
      if (enabledRef.current || event.button) {
        // allow middle click to cause drag
        originalHandleZoomMousedown.apply(this, [event]);
      }
    }

    select(interactionRect)
      .on("mousedown.zoom", handleZoomMousedownEvent)
      .property("syncTransform", () => syncTransform);
  }, [interactionRef, onZoom, width, height, onZooming]);

  const updateTransform = React.useCallback(
    (newTransform) => {
      const syncTransform = select(interactionRef.current).property(
        "syncTransform"
      );
      return syncTransform(newTransform);
    },
    [interactionRef]
  );

  return updateTransform;
}

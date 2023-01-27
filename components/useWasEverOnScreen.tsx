import { usePrevious } from "react-use";
import { useOnScreenAlt } from "./useOnScreen.1";

export function useWasEverOnScreen(ref) {
  const isOnScreen = useOnScreenAlt(ref);
  const wasPreviouslyOnScreen = usePrevious(isOnScreen);

  const wasEverOnScreen = wasPreviouslyOnScreen || isOnScreen;
  return wasEverOnScreen;
}

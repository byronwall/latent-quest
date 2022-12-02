import { QueryClient } from "react-query";

// disable the refresh when returning to the page
// consider adding back in for prod only?

// https://tanstack.com/query/v4/docs/guides/window-focus-refetching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

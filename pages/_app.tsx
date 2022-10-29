import "./styles.css";

import { MantineProvider } from "@mantine/core";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { Navigation } from "../components/Navigation";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  // disable the refresh when returning to the page
  // consider adding back in for prod only?
  // https://tanstack.com/query/v4/docs/guides/window-focus-refetching
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>Latent Quest</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={{
          colorScheme: "light",
        }}
      >
        <div className="container">
          <Navigation />
        </div>
        <Component {...pageProps} />
      </MantineProvider>
    </QueryClientProvider>
  );
}

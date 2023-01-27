import "../styles/globals.css";

import { MantineProvider } from "@mantine/core";
import Head from "next/head";
import { QueryClientProvider } from "react-query";

import { Navigation } from "../components/Navigation";
import { queryClient } from "../components/queryClient";
import { SdSelectedImages } from "../components/SdSelectedImages";
import { useAppStore } from "../model/store";

import type { AppProps } from "next/app";

export function reportWebVitals(metric) {
  console.log("web vital metrics", metric);
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const pendingImages = useAppStore((s) => s.pendingImages);
  const isPending = pendingImages.length > 0;

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
        <div>
          <div className={`h-0.5 ${isPending && "bg-sky-300"} `} />
          <Navigation />
        </div>
        <Component {...pageProps} />

        <SdSelectedImages />
      </MantineProvider>
    </QueryClientProvider>
  );
}

// import "./styles.css";
import "../styles/globals.css";

import { MantineProvider } from "@mantine/core";
import Head from "next/head";
import { QueryClientProvider } from "react-query";

import { Navigation } from "../components/Navigation";
import { queryClient } from "../components/queryClient";
import { SdSelectedImages } from "../components/SdSelectedImages";

import type { AppProps } from "next/app";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

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
          <Navigation />
        </div>
        <Component {...pageProps} />

        <SdSelectedImages />
      </MantineProvider>
    </QueryClientProvider>
  );
}

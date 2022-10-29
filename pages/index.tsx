import { Container } from "@mantine/core";
import Link from "next/link";

import { ImageList } from "../components/ImageList";

export function Index() {
  return (
    <>
      <div style={{ width: "90vw", margin: "auto" }}>
        <ImageList />
      </div>
    </>
  );
}

export default Index;

import { InferGetStaticPropsType } from "next";

import { ImageList } from "../components/ImageList";
import { queryFnGetAllGroups } from "../components/useGetAllGroups";

export async function getStaticProps() {
  const groupList = await queryFnGetAllGroups();

  return {
    props: {
      groupList,
    },
  };
}

export type ImageListProps = InferGetStaticPropsType<typeof getStaticProps>;

export default function Index(props: ImageListProps) {
  return (
    <>
      <div style={{ width: "90vw", margin: "auto" }}>
        <ImageList {...props} />
      </div>
    </>
  );
}

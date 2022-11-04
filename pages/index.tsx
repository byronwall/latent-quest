import { GetServerSideProps } from "next";

import { AllGroupResponse, ImageList } from "../components/ImageList";
import { queryFnGetAllGroups } from "../components/useGetAllGroups";

export const getServerSideProps: GetServerSideProps = async () => {
  const groupList = await queryFnGetAllGroups();

  const props: ImageListProps = {
    groupList,
  };

  return {
    props,
  };
};

export interface ImageListProps {
  groupList: AllGroupResponse[];
}

export default function Index(props: ImageListProps) {
  return (
    <>
      <div style={{ width: "90vw", margin: "auto" }}>
        <ImageList {...props} />
      </div>
    </>
  );
}

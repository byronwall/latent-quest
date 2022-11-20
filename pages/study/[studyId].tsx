import Link from "next/link";

import { SdImageStudy } from "../../components/SdImageStudy";
import { queryFnGetImageGroup } from "../../components/useGetImageGroup";
import { api_getStudy } from "../../model/api";

import type { SdImageStudyProps } from "../../components/SdImageStudy";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const studyId = params?.studyId as string;

  const initialStudyDef = await api_getStudy(studyId);

  const groupId = initialStudyDef.groupId;

  const imageGroupData = await queryFnGetImageGroup({ queryKey: [groupId] });

  const props: SdImageStudyProps = {
    imageGroupData,
    initialStudyDef,
  };

  return {
    props,
  };
};

export default function GroupPage(props: SdImageStudyProps) {
  return (
    <div style={{ width: "90vw", margin: "auto" }}>
      <Link href={`/group/${props.initialStudyDef.groupId}`}>
        Back to Group
      </Link>

      <SdImageStudy {...props} />
    </div>
  );
}

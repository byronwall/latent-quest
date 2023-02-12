import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

import { ImageList } from "../components/ImageList";
import { queryFnGetAllGroups } from "../components/useGetAllGroups";

import type { GetServerSideProps } from "next";
import type { AllGroupResponse } from "../components/ImageList";

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
  const session = useSession();
  const supabase = useSupabaseClient();

  return !session ? (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
    />
  ) : (
    <ImageList {...props} />
  );
}

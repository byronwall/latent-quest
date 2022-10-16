import { useRouter } from "next/router";
import { ImageGrid } from "../../components/ImageGrid";

export default function GroupPage() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <div>
      <h1>Group {id}</h1>

      <ImageGrid groupId={id} />
    </div>
  );
}

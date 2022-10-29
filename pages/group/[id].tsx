import { useRouter } from "next/router";
import { ImageGrid } from "../../components/ImageGrid";

export default function GroupPage() {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <div>
      <ImageGrid groupId={id} />
    </div>
  );
}

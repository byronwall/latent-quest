import { NavLink } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";

export function Navigation(props: {}) {
  const router = useRouter();

  const pathname = router.pathname;

  return (
    <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
      <Link href="/" passHref>
        <NavLink
          component="a"
          label={<h1>latent quest</h1>}
          active={pathname === "/"}
        />
      </Link>
      <Link href="/create" passHref>
        <NavLink component="a" label="create" active={pathname === "/create"} />
      </Link>
      <Link href="/choices" passHref>
        <NavLink
          component="a"
          label="choice mgr"
          active={pathname === "/choices"}
        />
      </Link>
    </div>
  );
}

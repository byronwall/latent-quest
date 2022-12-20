import Link from "next/link";
import { useRouter } from "next/router";

export function Navigation() {
  const router = useRouter();

  const pathname = router.pathname;

  return (
    <div className="flex border-0 border-b border-b-sky-300 items-start justify-between">
      <div className="flex content-center">
        <Link href="/" passHref>
          <NavLink label="latent.quest" active={pathname === "/"} />
        </Link>
      </div>
      <div className="flex content-center gap-2">
        <Link href="/create" passHref>
          <NavLink label="create" active={pathname === "/create"} />
        </Link>
        <Link href="/collections" passHref>
          <NavLink label="collections" active={pathname === "/collections"} />
        </Link>
        <Link href="/choices" passHref>
          <NavLink label="choice mgr" active={pathname === "/choices"} />
        </Link>
      </div>
      <div className="flex content-center">
        <Link href="/login" passHref>
          <NavLink label="login" active={pathname === "/login"} />
        </Link>
      </div>
    </div>
  );
}

export function NavLink(props) {
  // TODO: clean this comp up
  return (
    <a
      {...props}
      className={`p-2 ${props.active && " bg-sky-300"} hover:bg-sky-100 `}
    >
      {props.label}
    </a>
  );
}

import Link from "next/link";
import { useRouter } from "next/router";

export function Navigation() {
  const router = useRouter();

  const pathname = router.pathname;

  return (
    <div className="flex items-start justify-between border-0 border-b border-b-sky-300">
      <div className="flex content-center">
        <NavLink
          href="/"
          label={
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="favicon" className="h-8 w-8" />
              <span>latent.quest</span>
            </div>
          }
          active={pathname === "/"}
        />
      </div>
      <div className="flex content-center gap-2">
        <NavLink
          href="/create"
          label="create"
          active={pathname === "/create"}
        />

        <NavLink
          href="/collections"
          label="collections"
          active={pathname === "/collections"}
        />

        <NavLink
          href="/choices"
          label="choice mgr"
          active={pathname === "/choices"}
        />
      </div>
      <div className="flex content-center" />
    </div>
  );
}

export function NavLink(props) {
  return (
    <Link
      {...props}
      className={`p-2 ${props.active && " bg-sky-300"} hover:bg-sky-100 `}
    >
      {props.label}
    </Link>
  );
}

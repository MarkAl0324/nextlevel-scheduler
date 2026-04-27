"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";

type TabId = "incoming" | "outgoing" | "posts";

function normalizeTab(v: string | null): TabId {
  if (v === "incoming" || v === "outgoing" || v === "posts") return v;
  return "incoming";
}

export function MySwapsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const active = normalizeTab(searchParams.get("tab"));

  const setTab = (tab: TabId) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("tab", tab);
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className={styles.tabs} role="tablist" aria-label="My request tabs">
      <button
        type="button"
        role="tab"
        aria-selected={active === "incoming"}
        className={`${styles.tab} ${active === "incoming" ? styles.tabActive : ""}`}
        onClick={() => setTab("incoming")}
      >
        Incoming responses
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "outgoing"}
        className={`${styles.tab} ${active === "outgoing" ? styles.tabActive : ""}`}
        onClick={() => setTab("outgoing")}
      >
        My offers
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "posts"}
        className={`${styles.tab} ${active === "posts" ? styles.tabActive : ""}`}
        onClick={() => setTab("posts")}
      >
        My requests
      </button>
    </div>
  );
}

MySwapsTabs.Content = function Content(props: {
  render: (args: { tab: TabId }) => React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const tab = useMemo(() => normalizeTab(searchParams.get("tab")), [searchParams]);
  return <>{props.render({ tab })}</>;
};

"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { ScheduleViewTabs } from "../_components/ScheduleViewTabs";
import type { IsoDate } from "@/lib/demoData";
import { RosterDrawer, type RosterResponse } from "./RosterDrawer";

type CellVm = {
  isoDate: IsoDate;
  inMonth: boolean;
  providers: number;
  mas: number;
  badge: { text: string; className: string };
};

export function MonthClient(props: { title: string; subtitle: string; cells: CellVm[] }) {
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null);
  const [drawer, setDrawer] = useState<{ loading: boolean; error: string | null; data: RosterResponse | null }>({
    loading: false,
    error: null,
    data: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const cells = useMemo(() => props.cells, [props.cells]);

  const openDate = async (isoDate: IsoDate) => {
    setSelectedDate(isoDate);
    setDrawer({ loading: true, error: null, data: null });
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/roster?date=${encodeURIComponent(isoDate)}`, { signal: controller.signal });
      const json = (await res.json()) as unknown;
      if (!res.ok) {
        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : `HTTP ${res.status}`;
        setDrawer({ loading: false, error: String(msg), data: null });
        return;
      }
      setDrawer({ loading: false, error: null, data: json as RosterResponse });
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setDrawer({ loading: false, error: e instanceof Error ? e.message : "Failed to load roster.", data: null });
    }
  };

  const close = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSelectedDate(null);
    setDrawer({ loading: false, error: null, data: null });
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{props.title}</h1>
          <div className={styles.subtitle}>{props.subtitle}</div>
        </div>
        <ScheduleViewTabs />
      </div>

      <div className={styles.grid} aria-label="Month calendar">
        <div className={styles.weekdays} aria-hidden="true">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
            <div key={w} className={styles.weekday}>
              {w}
            </div>
          ))}
        </div>

        <div className={styles.cells}>
          {cells.map((c) => {
            const dayNum = Number(String(c.isoDate).slice(-2));
            return (
              <button
                key={c.isoDate}
                type="button"
                onClick={() => openDate(c.isoDate)}
                className={`${styles.cell} ${c.inMonth ? "" : styles.cellMuted}`}
                aria-label={`Open roster drawer for ${c.isoDate}`}
              >
                <div className={styles.cellTopRow}>
                  <div className={styles.dayNum}>{dayNum}</div>
                  <div className={styles.counts}>
                    {c.providers}P / {c.mas}MA
                  </div>
                </div>
                <span className={c.badge.className}>{c.badge.text}</span>
                <div className={styles.hint}>View roster →</div>
              </button>
            );
          })}
        </div>
      </div>

      <RosterDrawer
        isoDate={selectedDate}
        onClose={close}
        loading={drawer.loading}
        error={drawer.error}
        data={drawer.data}
      />
    </div>
  );
}


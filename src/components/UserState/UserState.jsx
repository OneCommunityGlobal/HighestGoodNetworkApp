import React, { useMemo } from "react";
import styles from "./UserState.module.css";

export default function UserState({ selections = [], catalog = [] }) {
  const byKey = useMemo(() => {
    const m = new Map();
    catalog.forEach(c => m.set(c.key, c));
    return m;
  }, [catalog]);

  const textColorFor = (hex) => {
    if (!hex || typeof hex !== "string") return "#fff";
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    return lum > 0.6 ? "#111" : "#fff"; 
  };

  const items = (selections || []).map(s => {
    const key = typeof s === "string" ? s : s.key;
    const cat = byKey.get(key);
    return {
      key,
      label: cat?.label ?? key,
      color: cat?.color ?? "#34495e", 
    };
  });

  return (
    <div className={styles.wrap}>
      {items.map(it => (
        <span
          key={it.key}
          className={styles.badge}
          style={{
            backgroundColor: it.color,
            color: textColorFor(it.color),
            borderColor: it.color
          }}
          title={it.label}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

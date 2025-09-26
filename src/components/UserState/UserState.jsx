import React from "react";

export default function UserState({ selections = [], catalog = [] }) {
  const byKey = React.useMemo(() => {
    const map = new Map();
    catalog.forEach(c => map.set(c.key, c));
    return map;
  }, [catalog]);

  if (!selections.length) return <span style={{opacity:.7}}>No tags</span>;

  return (
    <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
      {selections.map(({ key, assignedAt }) => {
        const item = byKey.get(key);
        const label = item?.label || key;
        const dt = assignedAt ? new Date(assignedAt) : null;
        const title = dt ? `Assigned: ${dt.toLocaleString()}` : "Assigned date unknown";
        return (
          <span
            key={key}
            title={title}
            style={{
              display:"inline-flex",
              alignItems:"center",
              padding:"2px 8px",
              borderRadius:999,
              border:"1px solid #ddd",
              fontSize:12,
              background:"#f7f7f7",
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}

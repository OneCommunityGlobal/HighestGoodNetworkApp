export default function CalendarView({
  dates,
  selected,
  onSelect,
  highlightedDates,
  currentMonth,
  onPickDate,
}) {
  const list = dates ?? highlightedDates ?? [];
  const sel = selected ?? null;
  const pick = onSelect ?? onPickDate ?? (() => {});
  if (!list || !list.length) return <div>No dates available.</div>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {list.map(d => {
        const isSel = d === sel;
        return (
          <button
            key={d}
            onClick={() => pick(d)}
            style={{
              textAlign: 'left',
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: isSel ? '#2563eb' : '#fff',
              color: isSel ? '#fff' : '#111',
            }}
          >
            {new Date(d).toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}

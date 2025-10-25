// If you already use a calendar lib, swap this for it.
// This simplified version renders a clickable list of available dates.

export default function CalendarView({ dates, selected, onSelect }) {
  if (!dates || !dates.length) return <div>No dates available.</div>;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {dates.map(d => {
        const isSel = d === selected;
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
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

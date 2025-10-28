export default function DateSelector({ dates, selected, value, onChange }) {
  const list = dates || [];
  const sel = selected ?? value ?? '';
  return (
    <select value={sel} onChange={e => onChange(e.target.value)}>
      {list.map(d => (
        <option key={d} value={d}>
          {new Date(d).toLocaleDateString()}
        </option>
      ))}
    </select>
  );
}

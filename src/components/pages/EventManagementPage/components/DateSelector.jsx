export default function DateSelector({ dates, selected, onChange }) {
  const list = dates || [];
  return (
    <select value={selected} onChange={e => onChange(e.target.value)}>
      {list.map(d => (
        <option key={d} value={d}>
          {new Date(d).toLocaleDateString()}
        </option>
      ))}
    </select>
  );
}

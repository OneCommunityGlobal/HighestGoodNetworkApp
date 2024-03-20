function LimitSelection({ onLimitChange }) {
  return (
    <select onChange={e => onLimitChange(e.target.value)} className="weekly-summaries-limit">
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="50">50</option>
      <option value="100">100</option>
    </select>
  );
}

export default LimitSelection;

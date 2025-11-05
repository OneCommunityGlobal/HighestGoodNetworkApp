export default function StatusRating({ status, rating, onChangeStatus, onChangeRating }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        <label htmlFor="statusSelect">Status:</label>
        <select id="statusSelect" value={status} onChange={e => onChangeStatus(e.target.value)}>
          <option>Active</option>
          <option>Finished</option>
        </select>
      </div>

      <div>
        <label htmlFor="ratingRange">Rating:</label>
        <input
          id="ratingRange"
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={rating}
          onChange={e => onChangeRating(Number(e.target.value))}
        />
        <span style={{ marginLeft: 8 }}>{rating.toFixed(1)} / 5</span>
      </div>
    </div>
  );
}

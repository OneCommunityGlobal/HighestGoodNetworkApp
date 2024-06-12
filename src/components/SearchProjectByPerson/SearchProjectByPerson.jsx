export default function SearchProjectByPerson({ onSearch }) {
  return (
    <form className="input-group mb-2">
      <div className="input-group-prepend">
        <span className="input-group-text search-field-container">Search</span>
      </div>
      <input
        type="text"
        className="form-control"
        placeholder="Person Name"
        onChange={e => {
          onSearch(e.target.value);
        }}
      />
    </form>
  );
}

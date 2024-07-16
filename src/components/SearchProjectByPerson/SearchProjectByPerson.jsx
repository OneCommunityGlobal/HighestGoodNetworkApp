export default function SearchProjectByPerson({ onSearch }) {
  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <form className="input-group mb-2" onSubmit={handleSubmit}>
      <div className="input-group-prepend">
        <span className="input-group-text search-field-container">Search</span>
      </div>
      <input
        type="text"
        className="form-control"
        placeholder="Person's Name"
        onChange={e => {
          onSearch(e.target.value);
        }}
      />
    </form>
  );
}

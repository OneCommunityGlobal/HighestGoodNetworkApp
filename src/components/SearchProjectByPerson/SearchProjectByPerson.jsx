import { useState } from 'react';

export default function SearchProjectByPerson({ onSearch, suggestions, onSelectSuggestion }) {
  const [inputValue, setInputValue] = useState(''); // Keep track of input value
  const [showSuggestions, setShowSuggestions] = useState(false); // Control whether suggestions are shown

  // Handle when the user types in the input field
  const handleInputChange = ({ target: { value } }) => {
    setInputValue(value);
    onSearch(value); // Trigger search in the parent component
    if (value.trim() === '') {
      // When input is cleared, notify the parent to reset the project list
      onSelectSuggestion(null); // Pass null or reset value to parent to fetch all projects
      setShowSuggestions(false); // Hide suggestions if input is empty
    } else {
      setShowSuggestions(true); // Show suggestions when the user types
    }
  };

  // Handle when a suggestion is clicked
  const handleSuggestionClick = suggestion => {
    setInputValue(`${suggestion.firstName} ${suggestion.lastName}`); // Set the selected suggestion
    setShowSuggestions(false); // Hide suggestions after selection
    onSelectSuggestion(suggestion); // Notify parent component of the selection
  };

  return (
    <div className="search-project-person">
      <form className="input-group mb-2" onSubmit={e => e.preventDefault()}>
        <div className="input-group-prepend">
          <span className="input-group-text search-field-container">Search</span>
        </div>
        <input
          type="text"
          className="form-control"
          placeholder="Person's Name"
          value={inputValue}
          onChange={handleInputChange} // Trigger input change
        />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map(suggestion => (
            <li key={suggestion._id} className="suggestion-item">
              <button
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-button"
              >
                {suggestion.firstName} {suggestion.lastName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

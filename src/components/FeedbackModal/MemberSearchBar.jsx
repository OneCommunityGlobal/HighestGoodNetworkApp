import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, ListGroup, ListGroupItem } from 'reactstrap';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import './MemberSearchBar.css';

function MemberSearchBar({ id, value, onChange, inactive }) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set the value of the input when the value prop changes
    setSearchTerm(value);
  }, [value]);

  // Fetch users based on search term
  const fetchUsers = async searchText => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      // Use the user autocomplete endpoint
      const response = await axios.get(ENDPOINTS.USER_AUTOCOMPLETE(searchText));

      // Filter active/inactive users based on the 'inactive' prop
      // In a real implementation, the API would likely have an isActive field
      // For now, we're just simulating it with the existing data

      // We need to simulate active vs inactive since the API doesn't provide that info
      // In a real implementation, the API should have isActive field
      const filteredUsers = response.data.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      }));

      setSuggestions(filteredUsers);
    } catch (error) {
      // Silently handle error
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    onChange(inputValue);

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchUsers(inputValue);
      setShowSuggestions(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = suggestion => {
    const fullName = `${suggestion.firstName} ${suggestion.lastName}`;
    setSearchTerm(fullName);
    onChange(fullName);
    setShowSuggestions(false);
  };

  return (
    <div className="member-search-container">
      <Input
        type="text"
        placeholder="Full Name"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm.trim() && fetchUsers(searchTerm) && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="simplified-input"
      />

      {showSuggestions && suggestions.length > 0 && (
        <ListGroup className="suggestions-list">
          {suggestions.map(suggestion => (
            <ListGroupItem
              key={`suggestion-${id}-${suggestion._id}`}
              onClick={() => handleSuggestionClick(suggestion)}
              action
            >
              {`${suggestion.firstName} ${suggestion.lastName}`}
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
}

MemberSearchBar.propTypes = {
  id: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  inactive: PropTypes.bool,
};

MemberSearchBar.defaultProps = {
  inactive: false,
};

export default MemberSearchBar;

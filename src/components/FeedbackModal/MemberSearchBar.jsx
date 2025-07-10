import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, ListGroup, ListGroupItem } from 'reactstrap';
import styles from './MemberSearchBar.module.css';

function MemberSearchBar({ id, value, onChange, inactive, usersList = [] }) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set the value of the input when the value prop changes
    setSearchTerm(value);
  }, [value]);

  // Filter users based on search term
  const filterUsers = searchText => {
    if (!searchText.trim() || !usersList || usersList.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const lowerSearchText = searchText.toLowerCase();

      // Filter users based on first name or last name containing the search text
      const filteredUsers = usersList.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerSearchText),
      );

      // Format users for display
      const formattedUsers = filteredUsers.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
      }));

      setSuggestions(formattedUsers);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error filtering users:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    onChange(inputValue);

    // Debounce the filtering
    const timeoutId = setTimeout(() => {
      filterUsers(inputValue);
      setShowSuggestions(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = suggestion => {
    const { fullName } = suggestion;
    setSearchTerm(fullName);
    onChange(fullName);
    setShowSuggestions(false);
  };

  return (
    <div className={`${styles.memberSearchContainer}`}>
      <Input
        type="text"
        placeholder="Full Name"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => {
          if (searchTerm.trim()) {
            filterUsers(searchTerm);
            setShowSuggestions(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className={`${styles.simplifiedInput}`}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ListGroup className={`${styles.suggestionsList}`}>
          {suggestions.map(suggestion => (
            <ListGroupItem
              key={`suggestion-${id}-${suggestion.firstName}-${suggestion.lastName}`}
              onClick={() => handleSuggestionClick(suggestion)}
              action
            >
              {suggestion.fullName}
            </ListGroupItem>
          ))}
        </ListGroup>
      )}

      {showSuggestions && suggestions.length === 0 && searchTerm.trim() !== '' && !loading && (
        <div className={`${styles.noResults}`}>
          No {inactive ? 'inactive' : 'active'} members found
        </div>
      )}

      {loading && <div className={`${styles.loadingIndicator}`}>Loading...</div>}
    </div>
  );
}

MemberSearchBar.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  inactive: PropTypes.bool,
  usersList: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
    }),
  ),
};

MemberSearchBar.defaultProps = {
  inactive: false,
  usersList: [],
};

export default MemberSearchBar;

import PropTypes from 'prop-types';
import styles from './style/CommunityMembersPage.module.css';

function SearchBar({ searchQuery, setSearchQuery, darkMode }) {
  return (
    <div className={`${styles.searchContainer} ${darkMode ? styles.darkSearch : ''}`}>
      <input
        type="text"
        placeholder="Search members by name or skill..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className={`${styles.searchInput} ${darkMode ? styles.darkSearchInput : ''}`}
      />
      {searchQuery && (
        <button
          type="button"
          className={`${styles.clearButton} ${darkMode ? styles.darkClearButton : ''}`}
          onClick={() => setSearchQuery('')}
        >
          ✕
        </button>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

export default SearchBar;

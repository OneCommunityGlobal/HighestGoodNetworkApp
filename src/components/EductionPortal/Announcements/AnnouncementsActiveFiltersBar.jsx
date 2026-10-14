import PropTypes from 'prop-types';

function AnnouncementsActiveFiltersBar({
  darkMode,
  searchQuery,
  courseFilter,
  dateFromFilter,
  dateToFilter,
  clearFilters,
}) {
  const hasActiveFilters = searchQuery || courseFilter || dateFromFilter || dateToFilter;
  if (!hasActiveFilters) return null;
  return (
    <span style={{ color: darkMode ? '#94a3b8' : '#666' }}>
      | Filters:
      {searchQuery && (
        <span
          style={{
            marginLeft: '5px',
            backgroundColor: '#e3f2fd',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
          }}
        >
          Search: &quot;{searchQuery}&quot;
        </span>
      )}
      {courseFilter && (
        <span
          style={{
            marginLeft: '5px',
            backgroundColor: '#f3e5f5',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
          }}
        >
          Course: &quot;{courseFilter}&quot;
        </span>
      )}
      {dateFromFilter && (
        <span
          style={{
            marginLeft: '5px',
            backgroundColor: '#e8f5e8',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
          }}
        >
          From: {dateFromFilter}
        </span>
      )}
      {dateToFilter && (
        <span
          style={{
            marginLeft: '5px',
            backgroundColor: '#fff3e0',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
          }}
        >
          To: {dateToFilter}
        </span>
      )}
      <button
        type="button"
        onClick={clearFilters}
        style={{
          marginLeft: '8px',
          padding: '2px 6px',
          backgroundColor: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '3px',
          fontSize: '10px',
          color: '#f44336',
          cursor: 'pointer',
        }}
      >
        Clear All
      </button>
    </span>
  );
}

AnnouncementsActiveFiltersBar.propTypes = {
  darkMode: PropTypes.bool,
  searchQuery: PropTypes.string,
  courseFilter: PropTypes.string,
  dateFromFilter: PropTypes.string,
  dateToFilter: PropTypes.string,
  clearFilters: PropTypes.func.isRequired,
};

AnnouncementsActiveFiltersBar.defaultProps = {
  darkMode: false,
  searchQuery: '',
  courseFilter: '',
  dateFromFilter: '',
  dateToFilter: '',
};

export default AnnouncementsActiveFiltersBar;

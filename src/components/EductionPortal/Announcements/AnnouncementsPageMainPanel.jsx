import PropTypes from 'prop-types';
import AnnouncementsBoard from './AnnouncementsBoard';
import AnnouncementsActiveFiltersBar from './AnnouncementsActiveFiltersBar';

const getAudienceLabel = selectedAudience => {
  if (selectedAudience === 'all') return 'All Audiences';
  if (selectedAudience === 'students') return 'Students Only';
  return 'Educators Only';
};

function AnnouncementsPageMainPanel({
  darkMode,
  userRole,
  handleCreateAnnouncement,
  searchQuery,
  handleSearchQueryChange,
  selectedAudience,
  courseFilter,
  dateFromFilter,
  dateToFilter,
  clearFilters,
  handleEditAnnouncement,
  announcements,
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          backgroundColor: darkMode ? '#1b2a41' : 'white',
          padding: '15px 30px',
          borderBottom: `1px solid ${darkMode ? '#3A506B' : '#e0e0e0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h4 style={{ margin: 0, fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333333' }}>
          Announcements
        </h4>
        {userRole === 'educator' && (
          <button
            type="button"
            onClick={handleCreateAnnouncement}
            style={{
              padding: '8px 16px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            + Create Announcement
          </button>
        )}
      </div>
      <div
        style={{
          backgroundColor: darkMode ? '#1b2a41' : 'white',
          padding: '10px 30px',
          borderBottom: `1px solid ${darkMode ? '#3A506B' : '#e0e0e0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '15px' }}>
          <span
            style={{
              color: '#007bff',
              fontWeight: 'bold',
              fontSize: '14px',
              borderBottom: '2px solid #007bff',
              paddingBottom: '5px',
            }}
          >
            Board
          </span>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#94a3b8' : '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            All
          </button>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#94a3b8' : '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Unread
          </button>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: darkMode ? '#94a3b8' : '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Scheduled
          </button>
        </div>
        <input
          type="text"
          placeholder="Search Announcements..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
          style={{
            padding: '6px 12px',
            border: `1px solid ${darkMode ? '#3A506B' : '#ccc'}`,
            borderRadius: '4px',
            fontSize: '12px',
            width: '200px',
            backgroundColor: darkMode ? '#243B5A' : 'white',
            color: darkMode ? '#e2e8f0' : '#333333',
          }}
        />
      </div>
      <div
        style={{
          backgroundColor: darkMode ? '#1b2a41' : 'white',
          padding: '15px 30px',
          borderBottom: `1px solid ${darkMode ? '#3A506B' : '#e0e0e0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h6
          style={{
            margin: 0,
            fontWeight: 'bold',
            fontSize: '14px',
            color: darkMode ? '#e2e8f0' : '#333333',
          }}
        >
          Latest
        </h6>
        <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#666' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <span>
              Showing:{' '}
              <strong style={{ color: '#007bff' }}>{getAudienceLabel(selectedAudience)}</strong>
            </span>
            <AnnouncementsActiveFiltersBar
              darkMode={darkMode}
              searchQuery={searchQuery}
              courseFilter={courseFilter}
              dateFromFilter={dateFromFilter}
              dateToFilter={dateToFilter}
              clearFilters={clearFilters}
            />
            {userRole === 'educator' && (
              <span style={{ color: '#28a745' }}>
                {'\uD83D\uDC68\u200D\uD83C\uDFEB'} <strong>Educator Mode</strong> (Can create/edit)
              </span>
            )}
            {userRole === 'student' && (
              <span style={{ color: '#17a2b8' }}>
                {'\uD83D\uDC68\u200D\uD83C\uDF93'} <strong>Student Mode</strong> (View only)
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: '20px 30px',
          backgroundColor: darkMode ? '#0d1b2a' : '#f8f9fa',
        }}
      >
        <AnnouncementsBoard
          userRole={userRole}
          onCreateAnnouncement={handleCreateAnnouncement}
          onEditAnnouncement={handleEditAnnouncement}
          announcements={announcements}
          selectedAudience={selectedAudience}
          searchQuery={searchQuery}
          courseFilter={courseFilter}
          dateFromFilter={dateFromFilter}
          dateToFilter={dateToFilter}
          isEmbedded
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

AnnouncementsPageMainPanel.propTypes = {
  darkMode: PropTypes.bool,
  userRole: PropTypes.string.isRequired,
  handleCreateAnnouncement: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  handleSearchQueryChange: PropTypes.func.isRequired,
  selectedAudience: PropTypes.string.isRequired,
  courseFilter: PropTypes.string,
  dateFromFilter: PropTypes.string,
  dateToFilter: PropTypes.string,
  clearFilters: PropTypes.func.isRequired,
  handleEditAnnouncement: PropTypes.func.isRequired,
  announcements: PropTypes.arrayOf(PropTypes.object).isRequired,
};

AnnouncementsPageMainPanel.defaultProps = {
  darkMode: false,
  searchQuery: '',
  courseFilter: '',
  dateFromFilter: '',
  dateToFilter: '',
};

export default AnnouncementsPageMainPanel;

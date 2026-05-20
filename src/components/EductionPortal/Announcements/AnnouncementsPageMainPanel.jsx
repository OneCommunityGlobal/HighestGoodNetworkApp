import PropTypes from 'prop-types';
import AnnouncementsBoard from './AnnouncementsBoard';
import AnnouncementsActiveFiltersBar from './AnnouncementsActiveFiltersBar';
import AnnouncementsRoleModeBadge from './AnnouncementsRoleModeBadge';
import { getAnnouncementsPanelTheme, getSectionBarStyle } from './announcementsPanelTheme';

const getAudienceLabel = selectedAudience => {
  if (selectedAudience === 'all') return 'All Audiences';
  if (selectedAudience === 'students') return 'Students Only';
  return 'Educators Only';
};

const tabButtonStyle = textMuted => ({
  background: 'none',
  border: 'none',
  color: textMuted,
  fontSize: '14px',
  cursor: 'pointer',
});

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
  const theme = getAnnouncementsPanelTheme(darkMode);
  const sectionBarStyle = getSectionBarStyle(theme);
  const isEducator = userRole === 'educator';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...sectionBarStyle, padding: '15px 30px' }}>
        <h4 style={{ margin: 0, fontWeight: 'bold', color: theme.textPrimary }}>Announcements</h4>
        {isEducator && (
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

      <div style={{ ...sectionBarStyle, padding: '10px 30px' }}>
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
          <button type="button" style={tabButtonStyle(theme.textMuted)}>
            All
          </button>
          <button type="button" style={tabButtonStyle(theme.textMuted)}>
            Unread
          </button>
          <button type="button" style={tabButtonStyle(theme.textMuted)}>
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
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '4px',
            fontSize: '12px',
            width: '200px',
            backgroundColor: theme.inputBg,
            color: theme.textPrimary,
          }}
        />
      </div>

      <div style={{ ...sectionBarStyle, padding: '15px 30px' }}>
        <h6 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: theme.textPrimary }}>
          Latest
        </h6>
        <div style={{ fontSize: '12px', color: theme.textMuted }}>
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
            <AnnouncementsRoleModeBadge userRole={userRole} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 30px', backgroundColor: theme.contentBg }}>
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

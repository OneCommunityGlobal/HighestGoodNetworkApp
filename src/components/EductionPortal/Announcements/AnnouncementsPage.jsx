import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AnnouncementsBoard from './AnnouncementsBoard';
import AnnouncementModal from './AnnouncementModal';

const EDUCATOR_ROLES = new Set(['Owner', 'Administrator', 'Mentor', 'Core Team']);

const getUserRole = authUser => {
  if (!authUser) return 'student';
  if (authUser.permissions?.frontPermissions?.includes('announcements_manage')) {
    return 'educator';
  }
  return EDUCATOR_ROLES.has(authUser.role) ? 'educator' : 'student';
};

const getAudienceLabel = selectedAudience => {
  if (selectedAudience === 'all') return 'All Audiences';
  if (selectedAudience === 'students') return 'Students Only';
  return 'Educators Only';
};

const getButtonStyle = (isActive, activeColor, darkMode) => {
  let borderColor;
  let bgColor;
  let textColor;
  if (isActive) {
    borderColor = activeColor;
    bgColor = activeColor;
    textColor = 'white';
  } else if (darkMode) {
    borderColor = '#555555';
    bgColor = '#3d3d3d';
    textColor = '#ffffff';
  } else {
    borderColor = '#ccc';
    bgColor = 'white';
    textColor = '#333';
  }
  return {
    padding: '6px 12px',
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
    color: textColor,
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  };
};

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Welcome to Phase 4 Education Portal',
    body:
      'We are excited to launch the new education portal features. Students can now access enhanced learning resources and educators can better manage their content.',
    author: 'Dr. Smith',
    audience: 'all',
    course: 'Mathematics',
    grade: 'Grade 5 PM',
    createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    isNew: true,
  },
  {
    id: 2,
    title: 'New Assignment Guidelines',
    body:
      'Please review the updated assignment submission guidelines. All assignments must be submitted through the new portal interface.',
    author: 'Prof. Johnson',
    audience: 'students',
    course: 'Computer Science',
    grade: 'Grade 8 PM',
    createdAt: new Date('2024-01-14T14:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-14T14:30:00Z').toISOString(),
    isNew: false,
  },
  {
    id: 3,
    title: 'Faculty Meeting Tomorrow',
    body:
      'Reminder: Monthly faculty meeting scheduled for tomorrow at 2 PM in the conference room.',
    author: 'Admin Team',
    audience: 'educators',
    course: 'Administration',
    grade: 'Grade 11 PM',
    createdAt: new Date('2024-01-13T09:15:00Z').toISOString(),
    updatedAt: new Date('2024-01-13T09:15:00Z').toISOString(),
    isNew: false,
  },
];

const getInputStyle = (darkMode, width) => ({
  padding: '6px',
  border: `1px solid ${darkMode ? '#3A506B' : '#ccc'}`,
  borderRadius: '4px',
  fontSize: '12px',
  width: width || '100%',
  backgroundColor: darkMode ? '#243B5A' : 'white',
  color: darkMode ? '#e2e8f0' : '#333333',
  colorScheme: darkMode ? 'dark' : 'light',
});

const applyAnnouncementUpdate = (ann, announcementData, targetId) => {
  if (ann.id === targetId) return { ...announcementData, id: targetId };
  return ann;
};

const FilterSidebar = ({
  darkMode,
  selectedAudience,
  setSelectedAudience,
  courseFilter,
  setCourseFilter,
  dateFromFilter,
  setDateFromFilter,
  dateToFilter,
  setDateToFilter,
}) => (
  <div
    style={{
      width: '250px',
      backgroundColor: darkMode ? '#1b2a41' : 'white',
      borderRight: `1px solid ${darkMode ? '#3A506B' : '#e0e0e0'}`,
      padding: '20px',
      boxShadow: darkMode ? '2px 0 4px rgba(0,0,0,0.3)' : '2px 0 4px rgba(0,0,0,0.1)',
    }}
  >
    <h5
      style={{ marginBottom: '20px', fontWeight: 'bold', color: darkMode ? '#e2e8f0' : '#333333' }}
    >
      Filters
    </h5>
    <div style={{ marginBottom: '25px' }}>
      <h6
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: darkMode ? '#e2e8f0' : '#333333',
        }}
      >
        Scope
      </h6>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={getButtonStyle(true, '#007bff', darkMode)}>All</button>
        <button style={getButtonStyle(false, '#007bff', darkMode)}>My Classes</button>
      </div>
    </div>
    <div style={{ marginBottom: '25px' }}>
      <h6
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: darkMode ? '#e2e8f0' : '#333333',
        }}
      >
        Audience
      </h6>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => setSelectedAudience('all')}
          style={getButtonStyle(selectedAudience === 'all', '#007bff', darkMode)}
        >
          All
        </button>
        <button
          onClick={() => setSelectedAudience('students')}
          style={getButtonStyle(selectedAudience === 'students', '#28a745', darkMode)}
        >
          Students
        </button>
        <button
          onClick={() => setSelectedAudience('educators')}
          style={getButtonStyle(selectedAudience === 'educators', '#17a2b8', darkMode)}
        >
          Educators
        </button>
      </div>
    </div>
    <div style={{ marginBottom: '25px' }}>
      <h6
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: darkMode ? '#e2e8f0' : '#333333',
        }}
      >
        Courses / Classes
      </h6>
      <input
        type="text"
        placeholder="Search Classes..."
        value={courseFilter}
        onChange={e => setCourseFilter(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          border: `1px solid ${darkMode ? '#555555' : '#ccc'}`,
          borderRadius: '4px',
          fontSize: '12px',
          backgroundColor: darkMode ? '#3d3d3d' : 'white',
          color: darkMode ? '#ffffff' : '#333333',
        }}
      />
    </div>
    <div style={{ marginBottom: '25px' }}>
      <h6
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px',
          color: darkMode ? '#e2e8f0' : '#333333',
        }}
      >
        Date
      </h6>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="date-from-filter"
            style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#666666' }}
          >
            From
          </label>
          <input
            id="date-from-filter"
            type="date"
            value={dateFromFilter}
            onChange={e => setDateFromFilter(e.target.value)}
            style={getInputStyle(darkMode)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="date-to-filter"
            style={{ fontSize: '11px', color: darkMode ? '#94a3b8' : '#666666' }}
          >
            To
          </label>
          <input
            id="date-to-filter"
            type="date"
            value={dateToFilter}
            onChange={e => setDateToFilter(e.target.value)}
            style={getInputStyle(darkMode)}
          />
        </div>
      </div>
    </div>
  </div>
);

FilterSidebar.propTypes = {
  darkMode: PropTypes.bool,
  selectedAudience: PropTypes.string,
  setSelectedAudience: PropTypes.func.isRequired,
  courseFilter: PropTypes.string,
  setCourseFilter: PropTypes.func.isRequired,
  dateFromFilter: PropTypes.string,
  setDateFromFilter: PropTypes.func.isRequired,
  dateToFilter: PropTypes.string,
  setDateToFilter: PropTypes.func.isRequired,
};

FilterSidebar.defaultProps = {
  darkMode: false,
  selectedAudience: 'all',
  courseFilter: '',
  dateFromFilter: '',
  dateToFilter: '',
};

const ActiveFiltersBar = ({
  darkMode,
  searchQuery,
  courseFilter,
  dateFromFilter,
  dateToFilter,
  clearFilters,
}) => {
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
};

ActiveFiltersBar.propTypes = {
  darkMode: PropTypes.bool,
  searchQuery: PropTypes.string,
  courseFilter: PropTypes.string,
  dateFromFilter: PropTypes.string,
  dateToFilter: PropTypes.string,
  clearFilters: PropTypes.func.isRequired,
};

ActiveFiltersBar.defaultProps = {
  darkMode: false,
  searchQuery: '',
  courseFilter: '',
  dateFromFilter: '',
  dateToFilter: '',
};

const selectAuthUser = state => state.auth.user;
const selectDarkMode = state => state.theme.darkMode;

const buildAnnouncementUpdater = (announcementData, targetId) => prev =>
  prev.map(ann => applyAnnouncementUpdate(ann, announcementData, targetId));

const prependItem = item => prev => [item, ...prev];

const createCreateAnnouncementHandler = (setEditingAnnouncement, setIsModalOpen) => () => {
  setEditingAnnouncement(null);
  setIsModalOpen(true);
};

const createEditAnnouncementHandler = (setEditingAnnouncement, setIsModalOpen) => announcement => {
  setEditingAnnouncement(announcement);
  setIsModalOpen(true);
};

const createCloseModalHandler = (setIsModalOpen, setEditingAnnouncement) => () => {
  setIsModalOpen(false);
  setEditingAnnouncement(null);
};

const createSaveAnnouncementHandler = ({
  editingAnnouncement,
  setAnnouncements,
  handleCloseModal,
}) => async announcementData => {
  try {
    if (editingAnnouncement) {
      const targetId = editingAnnouncement.id;
      setAnnouncements(buildAnnouncementUpdater(announcementData, targetId));
      handleCloseModal();
      alert('Announcement saved successfully!');
      return;
    }
    const newAnnouncement = {
      ...announcementData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isNew: true,
    };
    setAnnouncements(prependItem(newAnnouncement));
    handleCloseModal();
    alert('Announcement saved successfully!');
  } catch (error) {
    console.error('Failed to save announcement:', error);
    throw error;
  }
};

const createClearFiltersHandler = (
  setSearchQuery,
  setCourseFilter,
  setDateFromFilter,
  setDateToFilter,
) => () => {
  setSearchQuery('');
  setCourseFilter('');
  setDateFromFilter('');
  setDateToFilter('');
};

const createSearchQueryChangeHandler = setSearchQuery => event => {
  setSearchQuery(event.target.value);
};

const loadStoredAnnouncements = () => {
  try {
    const stored = localStorage.getItem('edu_announcements');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored announcements:', e);
  }
  return DEFAULT_ANNOUNCEMENTS;
};

const AnnouncementsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState(loadStoredAnnouncements);
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const authUser = useSelector(selectAuthUser);
  const darkMode = useSelector(selectDarkMode);
  const userRole = getUserRole(authUser);

  useEffect(() => {
    localStorage.setItem('edu_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const handleCreateAnnouncement = createCreateAnnouncementHandler(
    setEditingAnnouncement,
    setIsModalOpen,
  );
  const handleEditAnnouncement = createEditAnnouncementHandler(
    setEditingAnnouncement,
    setIsModalOpen,
  );
  const handleCloseModal = createCloseModalHandler(setIsModalOpen, setEditingAnnouncement);
  const handleSaveAnnouncement = createSaveAnnouncementHandler({
    editingAnnouncement,
    setAnnouncements,
    handleCloseModal,
  });
  const clearFilters = createClearFiltersHandler(
    setSearchQuery,
    setCourseFilter,
    setDateFromFilter,
    setDateToFilter,
  );
  const handleSearchQueryChange = createSearchQueryChangeHandler(setSearchQuery);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: darkMode ? '#0d1b2a' : '#f8f9fa',
        color: darkMode ? '#e2e8f0' : '#333333',
      }}
    >
      <FilterSidebar
        darkMode={darkMode}
        selectedAudience={selectedAudience}
        setSelectedAudience={setSelectedAudience}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        dateFromFilter={dateFromFilter}
        setDateFromFilter={setDateFromFilter}
        dateToFilter={dateToFilter}
        setDateToFilter={setDateToFilter}
      />
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
              <ActiveFiltersBar
                darkMode={darkMode}
                searchQuery={searchQuery}
                courseFilter={courseFilter}
                dateFromFilter={dateFromFilter}
                dateToFilter={dateToFilter}
                clearFilters={clearFilters}
              />
              {userRole === 'educator' && (
                <span style={{ color: '#28a745' }}>
                  {'\uD83D\uDC68\u200D\uD83C\uDFEB'} <strong>Educator Mode</strong> (Can
                  create/edit)
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
      <AnnouncementModal
        isOpen={isModalOpen}
        toggle={handleCloseModal}
        announcement={editingAnnouncement}
        onSave={handleSaveAnnouncement}
        userInfo={authUser}
      />
    </div>
  );
};

export default AnnouncementsPage;

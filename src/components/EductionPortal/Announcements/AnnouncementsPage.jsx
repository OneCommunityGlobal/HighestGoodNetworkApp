import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AnnouncementModal from './AnnouncementModal';
import AnnouncementsPageMainPanel from './AnnouncementsPageMainPanel';
import {
  getEducatorAnnouncements,
  getStudentAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  normalizeAnnouncement,
  loadAnnouncementFeed,
} from '~/services/announcementService';
import { permissions } from '../../../utils/constants';

const EDUCATOR_ROLES = new Set(['Owner', 'Administrator', 'Mentor', 'Core Team']);

const getUserRole = authUser => {
  if (!authUser) return 'student';
  if (authUser.permissions?.frontPermissions?.includes(permissions.announcements_manage)) {
    return 'educator';
  }
  return EDUCATOR_ROLES.has(authUser.role) ? 'educator' : 'student';
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

const AnnouncementsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [retry, setRetry] = useState(0);
  const uncertainCreate = useRef(false);
  const saving = useRef(false);
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  const authUser = useSelector(selectAuthUser);
  const darkMode = useSelector(selectDarkMode);
  const userRole = getUserRole(authUser);

  useEffect(() => {
    let cancelled = false;
    setLoadStatus('loading');
    setAnnouncements([]);
    const load = async () => {
      try {
        const [feed, authored] = await Promise.all([
          loadAnnouncementFeed(getStudentAnnouncements),
          userRole === 'educator'
            ? loadAnnouncementFeed(getEducatorAnnouncements)
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        const visible =
          userRole === 'educator'
            ? [...feed.filter(item => item.audience === 'all'), ...authored]
            : feed;
        const ownedIds = new Set(authored.map(item => item.id));
        setAnnouncements([
          ...new Map(
            visible.map(item => [
              item.id,
              {
                ...item,
                canEdit: ownedIds.has(item.id),
              },
            ]),
          ).values(),
        ]);
        uncertainCreate.current = false;
        setLoadStatus('ready');
      } catch {
        if (!cancelled) setLoadStatus('error');
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userRole, authUser?._id, authUser?.id, retry]);

  const handleCreateAnnouncement = createCreateAnnouncementHandler(
    setEditingAnnouncement,
    setIsModalOpen,
  );
  const handleEditAnnouncement = createEditAnnouncementHandler(
    setEditingAnnouncement,
    setIsModalOpen,
  );
  const handleCloseModal = createCloseModalHandler(setIsModalOpen, setEditingAnnouncement);
  const handleSaveAnnouncement = async data => {
    if (saving.current) throw new Error('An announcement is already being saved.');
    if (!editingAnnouncement && uncertainCreate.current) {
      throw new Error(
        'Creation could not be confirmed. Reload announcements before creating again.',
      );
    }
    saving.current = true;
    try {
      const response = editingAnnouncement
        ? await updateAnnouncement(editingAnnouncement.id, data)
        : await createAnnouncement(data);
      const saved = { ...normalizeAnnouncement(response.data), canEdit: true };
      setAnnouncements(
        editingAnnouncement
          ? buildAnnouncementUpdater(saved, editingAnnouncement.id)
          : prependItem(saved),
      );
      toast.success(
        editingAnnouncement
          ? 'Announcement updated successfully.'
          : 'Announcement created successfully.',
      );
    } catch (error) {
      if (!editingAnnouncement && ![400, 401, 403, 404].includes(error.response?.status)) {
        uncertainCreate.current = true;
        throw new Error(
          'Creation could not be confirmed. Reload announcements before creating again.',
        );
      }
      throw error;
    } finally {
      saving.current = false;
    }
  };
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
      {loadStatus !== 'ready' ? (
        <div role={loadStatus === 'error' ? 'alert' : undefined}>
          {loadStatus === 'loading' ? (
            <output>Loading announcements…</output>
          ) : (
            <>
              Could not load announcements.{' '}
              <button type="button" onClick={() => setRetry(value => value + 1)}>
                Retry
              </button>
            </>
          )}
        </div>
      ) : (
        <AnnouncementsPageMainPanel
          darkMode={darkMode}
          userRole={userRole}
          handleCreateAnnouncement={handleCreateAnnouncement}
          searchQuery={searchQuery}
          handleSearchQueryChange={handleSearchQueryChange}
          selectedAudience={selectedAudience}
          courseFilter={courseFilter}
          dateFromFilter={dateFromFilter}
          dateToFilter={dateToFilter}
          clearFilters={clearFilters}
          handleEditAnnouncement={handleEditAnnouncement}
          announcements={announcements}
        />
      )}
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

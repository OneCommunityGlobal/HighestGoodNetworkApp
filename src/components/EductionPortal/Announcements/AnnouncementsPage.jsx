import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AnnouncementsBoard from './AnnouncementsBoard';
import AnnouncementModal from './AnnouncementModal';

const AnnouncementsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  // Get user info from Redux state
  const authUser = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  
  // Determine user role based on authenticated user's role/permissions
  const getUserRole = () => {
    if (!authUser) return 'student'; // Default to student if no user
    
    // Check for educator permissions first (most specific)
    if (authUser.permissions?.frontPermissions?.includes('announcements_manage')) {
      return 'educator';
    }
    
    // Check role-based access as fallback (volunteers are treated as students)
    const educatorRoles = ['Owner', 'Administrator', 'Mentor', 'Core Team'];
    return educatorRoles.includes(authUser.role) ? 'educator' : 'student';
  };
  
  const userRole = getUserRole();

  // Helper function for button styling with dark mode support
  const getButtonStyle = (isActive = false, activeColor = '#007bff') => ({
    padding: '6px 12px',
    border: `1px solid ${isActive ? activeColor : (darkMode ? '#555555' : '#ccc')}`,
    backgroundColor: isActive ? activeColor : (darkMode ? '#3d3d3d' : 'white'),
    color: isActive ? 'white' : (darkMode ? '#ffffff' : '#333'),
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  });

  // Initialize with mock data on component mount
  useState(() => {
    const mockAnnouncements = [
      {
        id: 1,
        title: 'Welcome to Phase 4 Education Portal',
        body: 'We are excited to launch the new education portal features. Students can now access enhanced learning resources and educators can better manage their content.',
        author: 'Dr. Smith',
        audience: 'all',
        course: 'Mathematics',
        grade: 'Grade 5 PM',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
        isNew: true
      },
      {
        id: 2,
        title: 'New Assignment Guidelines',
        body: 'Please review the updated assignment submission guidelines. All assignments must be submitted through the new portal interface.',
        author: 'Prof. Johnson',
        audience: 'students',
        course: 'Computer Science',
        grade: 'Grade 8 PM',
        createdAt: new Date('2024-01-14T14:30:00Z'),
        updatedAt: new Date('2024-01-14T14:30:00Z'),
        isNew: false
      },
      {
        id: 3,
        title: 'Faculty Meeting Tomorrow',
        body: 'Reminder: Monthly faculty meeting scheduled for tomorrow at 2 PM in the conference room.',
        author: 'Admin Team',
        audience: 'educators',
        course: 'Administration',
        grade: 'Grade 11 PM',
        createdAt: new Date('2024-01-13T09:15:00Z'),
        updatedAt: new Date('2024-01-13T09:15:00Z'),
        isNew: false
      }
    ];
    setAnnouncements(mockAnnouncements);
  });

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleSaveAnnouncement = async (announcementData) => {
    try {
      console.log('Saving announcement:', announcementData);
      
      if (editingAnnouncement) {
        // Update existing announcement
        setAnnouncements(prev => prev.map(ann => 
          ann.id === editingAnnouncement.id 
            ? { ...announcementData, id: editingAnnouncement.id }
            : ann
        ));
      } else {
        // Add new announcement
        const newAnnouncement = {
          ...announcementData,
          id: Date.now(), // Simple ID generation for demo
          createdAt: new Date().toISOString(),
          isNew: true
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
      
      handleCloseModal();
      alert('Announcement saved successfully!');
    } catch (error) {
      console.error('Failed to save announcement:', error);
      throw error;
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa',
      color: darkMode ? '#ffffff' : '#333333'
    }}>
      {/* Left Sidebar - Filters */}
      <div style={{ 
        width: '250px', 
        backgroundColor: darkMode ? '#2d2d2d' : 'white', 
        borderRight: `1px solid ${darkMode ? '#444444' : '#e0e0e0'}`,
        padding: '20px',
        boxShadow: darkMode ? '2px 0 4px rgba(0,0,0,0.3)' : '2px 0 4px rgba(0,0,0,0.1)'
      }}>
        <h5 style={{ 
          marginBottom: '20px', 
          fontWeight: 'bold',
          color: darkMode ? '#ffffff' : '#333333'
        }}>Filters</h5>
        
        {/* Scope Filter */}
        <div style={{ marginBottom: '25px' }}>
          <h6 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: darkMode ? '#ffffff' : '#333333'
          }}>Scope</h6>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={getButtonStyle(true, '#007bff')}>All</button>
            <button style={getButtonStyle(false)}>My Classes</button>
          </div>
        </div>

        {/* Audience Filter */}
        <div style={{ marginBottom: '25px' }}>
          <h6 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: darkMode ? '#ffffff' : '#333333'
          }}>Audience</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setSelectedAudience('all')}
              style={getButtonStyle(selectedAudience === 'all', '#007bff')}
            >All</button>
            <button 
              onClick={() => setSelectedAudience('students')}
              style={getButtonStyle(selectedAudience === 'students', '#28a745')}
            >Students</button>
            <button 
              onClick={() => setSelectedAudience('educators')}
              style={getButtonStyle(selectedAudience === 'educators', '#17a2b8')}
            >Educators</button>
          </div>
        </div>

        {/* Courses/Classes Filter */}
        <div style={{ marginBottom: '25px' }}>
          <h6 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: darkMode ? '#ffffff' : '#333333'
          }}>Courses / Classes</h6>
          <input 
            type="text" 
            placeholder="Search Classes..." 
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${darkMode ? '#555555' : '#ccc'}`,
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: darkMode ? '#3d3d3d' : 'white',
              color: darkMode ? '#ffffff' : '#333333'
            }}
          />
        </div>

        {/* Date Filter */}
        <div style={{ marginBottom: '25px' }}>
          <h6 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: darkMode ? '#ffffff' : '#333333'
          }}>Date</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ 
                fontSize: '11px', 
                color: darkMode ? '#cccccc' : '#666666' 
              }}>From</label>
              <input 
                type="date" 
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: `1px solid ${darkMode ? '#555555' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: darkMode ? '#3d3d3d' : 'white',
                  color: darkMode ? '#ffffff' : '#333333'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ 
                fontSize: '11px', 
                color: darkMode ? '#cccccc' : '#666666' 
              }}>To</label>
              <input 
                type="date" 
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: `1px solid ${darkMode ? '#555555' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: darkMode ? '#3d3d3d' : 'white',
                  color: darkMode ? '#ffffff' : '#333333'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          backgroundColor: darkMode ? '#2d2d2d' : 'white',
          padding: '15px 30px',
          borderBottom: `1px solid ${darkMode ? '#444444' : '#e0e0e0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h4 style={{ 
            margin: 0, 
            fontWeight: 'bold',
            color: darkMode ? '#ffffff' : '#333333'
          }}>Announcements</h4>
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
                cursor: 'pointer'
              }}
            >
              + Create Announcement
            </button>
          )}
        </div>

        {/* Board Navigation */}
        <div style={{
          backgroundColor: darkMode ? '#2d2d2d' : 'white',
          padding: '10px 30px',
          borderBottom: `1px solid ${darkMode ? '#444444' : '#e0e0e0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ 
              color: '#007bff', 
              fontWeight: 'bold', 
              fontSize: '14px',
              borderBottom: '2px solid #007bff',
              paddingBottom: '5px'
            }}>Board</span>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}>All</button>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}>Unread</button>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}>Scheduled</button>
          </div>
          <input 
            type="text" 
            placeholder="Search Announcements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px',
              width: '200px'
            }}
          />
        </div>

        {/* Latest Section Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px 30px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h6 style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Latest</h6>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <span>
                Showing: <strong style={{ color: '#007bff' }}>
                  {selectedAudience === 'all' ? 'All Audiences' : 
                   selectedAudience === 'students' ? 'Students Only' : 'Educators Only'}
                </strong>
              </span>
              
              {/* Active Filters */}
              {(searchQuery || courseFilter || dateFromFilter || dateToFilter) && (
                <span style={{ color: '#666' }}>
                  | Filters: 
                  {searchQuery && <span style={{ marginLeft: '5px', backgroundColor: '#e3f2fd', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>Search: "{searchQuery}"</span>}
                  {courseFilter && <span style={{ marginLeft: '5px', backgroundColor: '#f3e5f5', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>Course: "{courseFilter}"</span>}
                  {dateFromFilter && <span style={{ marginLeft: '5px', backgroundColor: '#e8f5e8', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>From: {dateFromFilter}</span>}
                  {dateToFilter && <span style={{ marginLeft: '5px', backgroundColor: '#fff3e0', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>To: {dateToFilter}</span>}
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setCourseFilter('');
                      setDateFromFilter('');
                      setDateToFilter('');
                    }}
                    style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      backgroundColor: '#ffebee',
                      border: '1px solid #f44336',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: '#f44336',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                </span>
              )}
              
              {/* Role Indicator */}
              {userRole === 'educator' && (
                <span style={{ color: '#28a745' }}>
                  👨‍🏫 <strong>Educator Mode</strong> (Can create/edit)
                </span>
              )}
              {userRole === 'student' && (
                <span style={{ color: '#17a2b8' }}>
                  👨‍🎓 <strong>Student Mode</strong> (View only)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div style={{ 
          flex: 1, 
          padding: '20px 30px', 
          backgroundColor: darkMode ? '#1a1a1a' : '#f8f9fa' 
        }}>
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
            isEmbedded={true}
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

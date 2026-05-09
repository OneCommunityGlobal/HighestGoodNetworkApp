import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col, Card, CardBody, Button, Input, Badge } from 'reactstrap';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaCalendarAlt, FaUser, FaFilter } from 'react-icons/fa';
import styles from './AnnouncementsBoard.module.css';

const getEmptyMessage = selectedAudience => {
  if (selectedAudience === 'all') return 'There are no announcements yet.';
  return `No announcements for ${selectedAudience}.`;
};

const AnnouncementsBoard = ({
  userRole = 'student',
  onCreateAnnouncement,
  onEditAnnouncement,
  announcements = [],
  selectedAudience = 'all',
  searchQuery = '',
  courseFilter = '',
  dateFromFilter = '',
  dateToFilter = '',
  isEmbedded = false,
}) => {
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Filter announcements based on all filters
  useEffect(() => {
    console.log('Filtering announcements:', {
      selectedAudience,
      searchQuery,
      courseFilter,
      dateFromFilter,
      dateToFilter,
      totalAnnouncements: announcements.length,
    });

    console.log(
      'Sample announcement courses:',
      announcements.map(a => ({ title: a.title, course: a.course })),
    );

    const filtered = announcements.filter(announcement => {
      // Audience filter
      const audienceMatch =
        selectedAudience === 'all' ||
        announcement.audience === selectedAudience ||
        announcement.audience === 'all';

      // Search query filter (searches in title and body)
      const searchMatch =
        !searchQuery ||
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.author.toLowerCase().includes(searchQuery.toLowerCase());

      // Course filter (searches in course name, title, and author)
      const courseMatch =
        !courseFilter ||
        announcement.course?.toLowerCase().includes(courseFilter.toLowerCase()) ||
        announcement.title.toLowerCase().includes(courseFilter.toLowerCase()) ||
        announcement.author.toLowerCase().includes(courseFilter.toLowerCase());

      // Date filter
      const announcementDate = new Date(announcement.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD format
      const dateFromMatch = !dateFromFilter || announcementDate >= dateFromFilter;
      const dateToMatch = !dateToFilter || announcementDate <= dateToFilter;

      return audienceMatch && searchMatch && courseMatch && dateFromMatch && dateToMatch;
    });

    console.log('Filtered result:', filtered.length, 'announcements');
    setFilteredAnnouncements(filtered);
  }, [announcements, selectedAudience, searchQuery, courseFilter, dateFromFilter, dateToFilter]);

  const handleCreateClick = () => {
    if (onCreateAnnouncement) {
      onCreateAnnouncement();
    }
  };

  const handleEditClick = announcement => {
    if (onEditAnnouncement) {
      onEditAnnouncement(announcement);
    }
  };

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAudienceBadgeColor = audience => {
    switch (audience) {
      case 'students':
        return 'primary';
      case 'educators':
        return 'success';
      case 'all':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const renderEmbeddedContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: darkMode ? '#94a3b8' : '#666' }}>
          Loading announcements...
        </div>
      );
    }
    if (filteredAnnouncements.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: darkMode ? '#94a3b8' : '#666' }}>
          <p>No announcements found</p>
        </div>
      );
    }
    return filteredAnnouncements.map(announcement => (
      <div
        key={announcement.id}
        style={{
          backgroundColor: darkMode ? '#1b2a41' : 'white',
          border: `1px solid ${darkMode ? '#3A506B' : '#e0e0e0'}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px',
          }}
        >
          <h5
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '16px',
              color: darkMode ? '#e9ecef' : '#333',
              flex: 1,
            }}
          >
            {announcement.title}
          </h5>
          {userRole === 'educator' && (
            <Button
              size="sm"
              color="light"
              onClick={() => handleEditClick(announcement)}
              style={{
                padding: '4px 8px',
                border: `1px solid ${darkMode ? '#3A506B' : '#ccc'}`,
                backgroundColor: darkMode ? '#243B5A' : '#f8f9fa',
                color: darkMode ? '#e2e8f0' : '#333',
              }}
            >
              <FaEdit size={12} />
            </Button>
          )}
        </div>

        {/* Author and metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '10px',
            fontSize: '13px',
            color: darkMode ? '#94a3b8' : '#666',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            By{' '}
            <strong style={{ color: darkMode ? '#e2e8f0' : '#333' }}>{announcement.author}</strong>
          </span>
          <span>|</span>
          <span>{announcement.course || 'General'}</span>
          <span>|</span>
          <span>{announcement.grade || 'All Grades'}</span>
          <span>|</span>
          <span>
            Audience:
            <Badge
              color={getAudienceBadgeColor(announcement.audience)}
              style={{
                marginLeft: '5px',
                fontSize: '10px',
                padding: '2px 6px',
              }}
            >
              {announcement.audience === 'all' ? 'Everyone' : announcement.audience}
            </Badge>
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            margin: 0,
            lineHeight: '1.5',
            color: darkMode ? '#94a3b8' : '#555',
            fontSize: '14px',
          }}
        >
          {announcement.body.length > 200
            ? `${announcement.body.substring(0, 200)}...`
            : announcement.body}
        </p>
      </div>
    ));
  };

  const renderGridContent = () => {
    if (loading) {
      return (
        <Col xs={12} className="text-center">
          <div className={styles.loadingSpinner}>Loading announcements...</div>
        </Col>
      );
    }
    if (filteredAnnouncements.length === 0) {
      return (
        <Col xs={12} className="text-center">
          <div className={styles.emptyState}>
            <FaCalendarAlt className={styles.emptyIcon} />
            <h4>No announcements found</h4>
            <p>{getEmptyMessage(selectedAudience)}</p>
            {userRole === 'educator' && (
              <Button color="primary" onClick={handleCreateClick}>
                Create First Announcement
              </Button>
            )}
          </div>
        </Col>
      );
    }
    return filteredAnnouncements.map(announcement => (
      <Col lg={6} xl={4} key={announcement.id} className={styles.announcementCol}>
        <Card
          className={`${styles.announcementCard} ${
            announcement.isNew ? styles.newAnnouncement : ''
          }`}
        >
          <CardBody>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <h5 className={styles.announcementTitle}>{announcement.title}</h5>
                {announcement.isNew && (
                  <Badge color="warning" className={styles.newBadge}>
                    NEW
                  </Badge>
                )}
              </div>
              {userRole === 'educator' && (
                <Button
                  size="sm"
                  color="light"
                  onClick={() => handleEditClick(announcement)}
                  className={styles.editButton}
                >
                  <FaEdit />
                </Button>
              )}
            </div>
            <div className={styles.cardBody}>
              <p className={styles.announcementBody}>
                {announcement.body.length > 150
                  ? `${announcement.body.substring(0, 150)}...`
                  : announcement.body}
              </p>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.authorInfo}>
                <FaUser className={styles.authorIcon} />
                <span className={styles.authorName}>{announcement.author}</span>
              </div>
              <div className={styles.metaInfo}>
                <Badge
                  color={getAudienceBadgeColor(announcement.audience)}
                  className={styles.audienceBadge}
                >
                  {announcement.audience === 'all' ? 'Everyone' : announcement.audience}
                </Badge>
                <span className={styles.dateInfo}>{formatDate(announcement.createdAt)}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    ));
  };

  if (isEmbedded) {
    return <div style={{ backgroundColor: 'transparent' }}>{renderEmbeddedContent()}</div>;
  }

  return (
    <div className={`${styles.announcementsBoard} ${darkMode ? styles.darkMode : ''}`}>
      <Container fluid>
        {/* Header Section */}
        <Row className={styles.headerRow}>
          <Col md={8}>
            <h2 className={styles.boardTitle}>
              <FaCalendarAlt className={styles.titleIcon} />
              Announcements
            </h2>
          </Col>
          <Col md={4} className="d-flex align-items-center justify-content-end">
            {userRole === 'educator' && (
              <Button color="primary" onClick={handleCreateClick} className={styles.createButton}>
                <FaPlus className="me-2" />
                New Announcement
              </Button>
            )}
          </Col>
        </Row>

        {/* Filter Section */}
        <Row className={styles.filterRow}>
          <Col md={6}>
            <div className={styles.filterSection}>
              <FaFilter className={styles.filterIcon} />
              <Input
                type="select"
                value={selectedAudience}
                onChange={e => setSelectedAudience(e.target.value)}
                className={styles.audienceFilter}
              >
                <option value="all">All Audiences</option>
                <option value="students">Students Only</option>
                <option value="educators">Educators Only</option>
              </Input>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <span className={styles.resultCount}>
              {filteredAnnouncements.length} announcement
              {filteredAnnouncements.length === 1 ? '' : 's'}
            </span>
          </Col>
        </Row>

        {/* Announcements Grid */}
        <Row>{renderGridContent()}</Row>
      </Container>
    </div>
  );
};

AnnouncementsBoard.propTypes = {
  userRole: PropTypes.string,
  onCreateAnnouncement: PropTypes.func,
  onEditAnnouncement: PropTypes.func,
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      title: PropTypes.string,
      body: PropTypes.string,
      audience: PropTypes.string,
      author: PropTypes.string,
      course: PropTypes.string,
      grade: PropTypes.string,
      createdAt: PropTypes.string,
      isNew: PropTypes.bool,
    }),
  ),
  selectedAudience: PropTypes.string,
  searchQuery: PropTypes.string,
  courseFilter: PropTypes.string,
  dateFromFilter: PropTypes.string,
  dateToFilter: PropTypes.string,
  isEmbedded: PropTypes.bool,
};

export default AnnouncementsBoard;

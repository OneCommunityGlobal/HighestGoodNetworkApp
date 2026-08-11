import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Nav, NavItem, NavLink, TabContent, TabPane, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import ResourceRequestsTab from './ResourceRequestsTab';
import CertificationsTab from './CertificationsTab';
import styles from './PMResourceDashboard.module.css';

/**
 * PMResourceDashboard - Resource Management Dashboard for Project Managers
 *
 * Features:
 * - Combined dashboard with tabs for Resource Requests and Certifications
 * - Filter by status (pending, approved, expired) and by teacher ID
 * - Approve/Deny controls for resource requests
 * - Training status and expiry tracking for certifications
 * - Export functionality for training summaries
 */
function PMResourceDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <Container fluid className={`${styles.dashboard} ${darkMode ? styles.dashboardDark : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={`${styles.title} ${darkMode ? styles.titleDark : ''}`}>
          Resource Management Dashboard
        </h1>
        <p className={`${styles.subtitle} ${darkMode ? styles.subtitleDark : ''}`}>
          Manage teacher resource requests and educator certifications
        </p>
      </div>

      {/* Tabs Navigation */}
      <Row>
        <Col lg={12}>
          <Nav tabs className={styles.tabNav} role="tablist">
            <NavItem>
              <NavLink
                id="resource-requests-tab"
                tag="button"
                type="button"
                role="tab"
                aria-selected={activeTab === 'requests'}
                aria-controls="resource-requests-panel"
                className={classnames(styles.tabLink, {
                  [styles.tabLinkActive]: activeTab === 'requests',
                })}
                onClick={() => toggleTab('requests')}
              >
                <span className={styles.tabIcon}>📋</span> Resource Requests
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                id="certifications-tab"
                tag="button"
                type="button"
                role="tab"
                aria-selected={activeTab === 'certifications'}
                aria-controls="certifications-panel"
                className={classnames(styles.tabLink, {
                  [styles.tabLinkActive]: activeTab === 'certifications',
                })}
                onClick={() => toggleTab('certifications')}
              >
                <span className={styles.tabIcon}>🎓</span> Certifications
              </NavLink>
            </NavItem>
          </Nav>

          {/* Tab Content */}
          <TabContent
            activeTab={activeTab}
            className={`${styles.tabContent} ${darkMode ? styles.tabContentDark : ''}`}
          >
            <TabPane
              tabId="requests"
              id="resource-requests-panel"
              role="tabpanel"
              aria-labelledby="resource-requests-tab"
            >
              {activeTab === 'requests' && <ResourceRequestsTab darkMode={darkMode} />}
            </TabPane>
            <TabPane
              tabId="certifications"
              id="certifications-panel"
              role="tabpanel"
              aria-labelledby="certifications-tab"
            >
              {activeTab === 'certifications' && <CertificationsTab darkMode={darkMode} />}
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </Container>
  );
}

export default PMResourceDashboard;

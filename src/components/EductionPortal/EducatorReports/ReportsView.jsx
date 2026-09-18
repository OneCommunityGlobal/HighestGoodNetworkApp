import React, { useState } from 'react';
import { Container, Nav, NavItem, NavLink } from 'reactstrap';
import { useSelector } from 'react-redux';
import DashboardLayout from './DashboardLayout/DashboardLayout';
import styles from './ReportsView.module.css';
import ReportFilterBar from './components/ReportFilterBar/ReportFilterBar';
import IndividualReportView from './components/IndividualReportView/IndividualReportView';
import ClassPerformanceView from './components/ClassPerformanceView/ClassPerformanceView';

const DEFAULT_FILTERS = {
  studentId: '',
  classId: '',
  subject: 'all',
  dateRange: 'lastMonth',
  startDate: '',
  endDate: '',
};

const ReportsView = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const handleFilterChange = updatedFields => {
    setFilters(prev => ({ ...prev, ...updatedFields }));
  };

  const handleTabChange = tab => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  return (
    <DashboardLayout>
      <div className={`${styles.dashboardContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Analytics: Actionable Visualizations</h1>
        </div>

        <Container fluid>
          <Nav tabs className={styles.reportTabs}>
            <NavItem>
              <NavLink
                className={activeTab === 'individual' ? styles.activeTab : styles.reportTab}
                onClick={() => handleTabChange('individual')}
                role="button"
                tabIndex={0}
              >
                Individual Reports
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === 'class' ? styles.activeTab : styles.reportTab}
                onClick={() => handleTabChange('class')}
                role="button"
                tabIndex={0}
              >
                Class Reports
              </NavLink>
            </NavItem>
          </Nav>

          <ReportFilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            activeTab={activeTab}
          />

          {activeTab === 'individual' ? (
            <IndividualReportView filters={filters} />
          ) : (
            <ClassPerformanceView filters={filters} />
          )}
        </Container>
      </div>
    </DashboardLayout>
  );
};

export default ReportsView;

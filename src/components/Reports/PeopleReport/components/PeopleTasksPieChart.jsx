/* eslint-disable import/prefer-default-export */
import { useSelector } from 'react-redux';
import UserProjectD3PieChart from '../../../common/PieChart/ProjectPieChart';

import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import styles from './PeopleTasksPieChart.module.css';

export function PeopleTasksPieChart({ darkMode }) {
  const {
    tasksWithLoggedHoursById,
    showTasksPieChart,
    showProjectsPieChart,
    tasksLegend,
    hoursLoggedToProjectsOnly,
  } = useSelector(peopleTasksPieChartViewData);

  const DONUT_MIN = 260;   // px the donut needs
  const ROW_H = 26;        // legend row height
  const HEADER_H = 32;
  const VSPACE = 24;
  
  const projectsHeight = Math.max(
    DONUT_MIN,
    HEADER_H + VSPACE + ROW_H * Math.max(1, hoursLoggedToProjectsOnly.length)
  );
  const tasksHeight = Math.max(
    DONUT_MIN,
    HEADER_H + VSPACE + ROW_H * Math.max(1, tasksLegend.length)
  );


  if (!showTasksPieChart && !showProjectsPieChart) {
    return null;
  }

  return (
    <div className={`${styles['people-pie-charts-wrapper']} ${darkMode ? styles['text-light'] : ''}`}>
      {hoursLoggedToProjectsOnly.length !== 0 && (
        <ReportPage.ReportBlock darkMode={darkMode} style={{ overflow: 'visible' }} className={styles['pie-no-scroll']}>
          <h5 className={styles['people-pie-charts-header']}>Time Logged to Projects/Non-tasks</h5>
          <div style={{ width: '100%' }}>
            <div className={styles['people-report-pie-wrapper']}>
              <UserProjectD3PieChart
                pieChartId="projectsPieChart"
                darkMode={darkMode}
                projectsData={hoursLoggedToProjectsOnly}
                tasksData={tasksLegend}
              />
            </div>
          </div>
        </ReportPage.ReportBlock>
      )}
    </div>
  );
}
/* eslint-disable import/prefer-default-export */
import { useSelector } from 'react-redux';
import UserProjectD3PieChart from '../../../common/PieChart/ProjectPieChart';
import { FiFolder } from "react-icons/fi";
import { peopleTasksPieChartViewData } from '../selectors';
import { ReportPage } from '../../sharedComponents/ReportPage';
import styles from './PeopleTasksPieChart.module.css';
import clsx from 'clsx';

export function PeopleTasksPieChart({ darkMode }) {
  const {
    tasksLegend,
    hoursLoggedToProjectsOnly,
  } = useSelector(peopleTasksPieChartViewData);

  const hasProjectData = hoursLoggedToProjectsOnly.length > 0;

  return (
    <div
    className={clsx(styles['people-pie-charts-wrapper'], !hasProjectData && styles['full-height'])}
    >
      {hasProjectData && (
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

      {!hasProjectData && (
        <ReportPage.ReportBlock darkMode={darkMode} className={styles['pie-empty-state']}>
          <div className={styles['pie-empty-state-inner']} role="status">
            <div className={styles['pie-empty-state-icon']} aria-hidden="true">
              <FiFolder size={20}/>
            </div>
            <h5 className={styles['pie-empty-state-title']}>No project time logged yet</h5>
            <p className={styles['pie-empty-state-body']}>
              Once this person logs hours to a project, a breakdown of where their time is going will appear here.
            </p>
          </div>
        </ReportPage.ReportBlock>
      )}
    </div>
  );
}
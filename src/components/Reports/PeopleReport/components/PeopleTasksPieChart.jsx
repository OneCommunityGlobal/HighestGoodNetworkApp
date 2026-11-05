/* eslint-disable import/prefer-default-export */
import { useSelector } from 'react-redux';
import UserProjectD3PieChart from '../../../common/PieChart/ProjectPieChart';
import { FiFolder } from "react-icons/fi";
import { peopleTasksPieChartViewData } from '../selectors';
import styles from './PeopleTasksPieChart.module.css';
import { clsx } from 'clsx';

export function PeopleTasksPieChart({ darkMode }) {
  const {
    showProjectsPieChart,
    tasksLegend,
    hoursLoggedToProjectsOnly,
  } = useSelector(peopleTasksPieChartViewData);
  
  return (
    <div
    className={clsx(styles['people-pie-charts-wrapper'], !showProjectsPieChart && styles['full-height'])}
    >
      {showProjectsPieChart && (
        <div>
          <h5 className={styles['people-pie-charts-header']}>Time Logged to Projects/Non-tasks</h5>

          <UserProjectD3PieChart
            pieChartId="projectsPieChart"
            darkMode={darkMode}
            projectsData={hoursLoggedToProjectsOnly}
            tasksData={tasksLegend}
          />
        </div>
      )}
      {!showProjectsPieChart && (
          <div className={styles['pie-empty-state-inner']}>
            <div className={styles['pie-empty-state-icon']} aria-hidden="true">
              <FiFolder size={20}/>
            </div>
            <h5 className={styles['pie-empty-state-title']}>No project time logged yet</h5>
            <p className={styles['pie-empty-state-body']}>
              Once this person logs hours to a project, a breakdown of where their time is going will appear here.
            </p>
          </div>
      )}
    </div>
  );
}

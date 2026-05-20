/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {ProjectPieChart} from '../ProjectPieChart/ProjectPieChart';
import './PieChartByProject.css';
import TriMembersStateToggleSwitch from '../TriMembersStateToggleSwitch/TriMembersStateToggleSwitch'
import style from '../../../UserProfile/UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { resolvePieChartUserData } from './pieChartUserDataUtils';

export function PieChartByProject({
  mergedProjectUsersArray,
  projectName,
  darkMode
}) {
  const [showMembers, setShowMembers] = useState(null);
  const [userData, setUserData] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [inactiveData, setInactiveData] = useState([]);
  const [activeData, setActiveData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [globalInactiveHours, setGlobalInactiveHours] = useState(0);
  const [globalactiveHours, setGlobalActiveHours] = useState(0);

  const noDataPlaceholder = [{
    name: "No Data",
    value: 1/1000,
    projectName,
    totalHoursCalculated: totalHours,
    lastName: ""
  }];

  const updateWindowSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateWindowSize);
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  const handleShowPieChart = () => {
    setIsChecked(!isChecked);
  };

  const handleShowMembersChange = (newState) => {
    if (newState.showActive) {
      setShowMembers(true);
    } else if (newState.showInactive) {
      setShowMembers(false);
    } else {
      setShowMembers(null);
    }
  };

  useEffect(() => {
    const chartData = resolvePieChartUserData({
      mergedProjectUsersArray,
      projectName,
      showMembers,
      noDataPlaceholder,
    });
    setTotalHours(chartData.totalHours);
    setActiveData(chartData.activeData);
    setInactiveData(chartData.inactiveData);
    setGlobalInactiveHours(chartData.globalInactiveHours);
    setGlobalActiveHours(chartData.globalactiveHours);
    setUserData(chartData.userData);
  }, [mergedProjectUsersArray, showMembers, projectName]);

  return (
    <div className={`${darkMode ? 'text-light' : ''} w-100`}>
      <div className={`${darkMode ? 'text-light' : ''} pie-chart-title w-100`}><h4>Pie Charts</h4></div>
      <div><h5>{projectName}</h5></div>
      <div className="pie-chart-description">
        <div>
        <label
          className={darkMode ? 'text-light' : ''}
          style={{paddingRight: '1rem' }}
        >
            {isChecked ? 'All-Time Total Hours by All Member (Hide PieChart)' : 'All-Time Total Hours by Member (Show PieChart)'}
        </label>
          <input
            type="checkbox"
            className="pie-chart-checkbox"
            checked={isChecked}
            onChange={handleShowPieChart}
          />
        </div>

        {isChecked && ( <div style={{textAlign:'left', margin:'auto'}}>
        <p style={{textAlign:'center'}}>{showMembers === null ? 'All members' : ''}</p>
        <div className={style.switchSection}>
        <div style={{ wordBreak: 'keep-all', color: darkMode ? 'white' : ''}}
          className={`d-flex flex-row align-items-center justify-content-between ${style.switchContainer}`}>
          <p className={darkMode ? 'text-light' : 'blue'}>Inactive Members</p>
          <div className="pr-2">
            <TriMembersStateToggleSwitch
              value={showMembers}
              onChange={handleShowMembersChange}
            />
          </div>
          <p className={darkMode ? 'text-light' : 'green'}>Active Members</p>
        </div>
        </div>
          <p style={{fontWeight:'bold'}}>Total Active Members:  {activeData.length}  <span> - Hrs Applied: { globalactiveHours.toFixed(2) } </span> </p>
          <p style={{fontWeight:'bold'}}>Total Inactive Members: {inactiveData.length} <span> - Hrs Applied: { globalInactiveHours.toFixed(2) } </span> </p>
          <p style={{fontWeight:'bold'}}>Total Applied Hours: {totalHours.toFixed(2)} </p>
          <p style={{fontWeight:'bold'}}>Total Members:  {mergedProjectUsersArray.length}</p>
        </div>)}

      </div>
        {isChecked && (<div style={{ width: '100%', height: '32rem' }}>
        <ProjectPieChart userData={totalHours > 0 ? userData : noDataPlaceholder} windowSize={windowSize.width} darkMode={darkMode} />
      </div>)}

    </div>
  )  
}

PieChartByProject.propTypes = {
  mergedProjectUsersArray: PropTypes.arrayOf(PropTypes.object).isRequired,
  projectName: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

PieChartByProject.defaultProps = {
  darkMode: false,
};
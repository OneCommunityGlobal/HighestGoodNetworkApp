/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import {ProjectPieChart} from '../ProjectPieChart/ProjectPieChart';
import './PieChartByProject.css';
import TriMembersStateToggleSwitch from '../TriMembersStateToggleSwitch/TriMembersStateToggleSwitch'
import style from '../../../UserProfile/UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';

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

  useEffect(() => {
    const totalHoursCalculated = mergedProjectUsersArray.reduce((acc, curr) => {
      return ((acc + curr.totalSeconds));
    }, 0) / 3600;
    setTotalHours(totalHoursCalculated);
    const activeUsers = mergedProjectUsersArray.filter(member => member.personId.isActive )
    setActiveData(activeUsers);

    const arrData = mergedProjectUsersArray.map(member => {
      const data = {
        name: `${member.personId.firstName}`,
        value: member.totalSeconds/3600,
        projectName,
        totalHoursCalculated,
        lastName: member.personId.lastName
      }
      return data
    });


    if (showMembers === false) {
      const inactiveUsers = mergedProjectUsersArray.filter(member => !member.personId.isActive )
      setInactiveData(inactiveUsers);

      if (inactiveUsers.length ===0) {
        setUserData(noDataPlaceholder)
      }
      else {
        const totalHoursInactive = inactiveUsers.reduce((acc, curr) => {
          return ((acc + curr.totalSeconds));
        }, 0) / 3600;
        setGlobalInactiveHours(totalHoursInactive);

        const inactiveArr = inactiveData.map(member => {
          const data = {
            name: `${member.personId.firstName}`,
            value: member.totalSeconds/3600,
            projectName,
            totalHoursCalculated: totalHoursInactive,
            lastName: member.personId.lastName
          }
          return data;
        });
        const sortedArr = inactiveArr.sort((a, b) => (a.name).localeCompare(b.name))
        setUserData(sortedArr)
      }
    } else    if (showMembers === true) {
      const au = mergedProjectUsersArray.filter(member => member.personId.isActive )
      setActiveData(au);

      const totalHoursActive = activeUsers.reduce((acc, curr) => {
        return ((acc + curr.totalSeconds));
      }, 0) / 3600;
      setGlobalActiveHours(totalHoursActive);

      const activeArr = activeData.map(member => {
        const data = {
          name: `${member.personId.firstName}`,
          value: member.totalSeconds/3600,
          projectName,
          totalHoursCalculated: totalHoursActive,
          lastName: member.personId.lastName
        }
        return data;
      });
      const sortedArr = activeArr.sort((a, b) => (a.name).localeCompare(b.name))
      setUserData(sortedArr)
    } else {
      const sortedArr = arrData.sort((a, b) => (a.name).localeCompare(b.name))
      setUserData(sortedArr)
    }

  }, [mergedProjectUsersArray,showMembers])

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

  const noDataPlaceholder = [{
    name: "No Data",
    value: 1/1000,
    projectName: projectName,
    totalHoursCalculated: totalHours,
    lastName: ""
  }];

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
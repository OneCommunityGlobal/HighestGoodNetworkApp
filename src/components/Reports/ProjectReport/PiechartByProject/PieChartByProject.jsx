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

  const noDataPlaceholder = [{
    name: "No Data",
    value: 1/1000,
    projectName,
    totalHoursCalculated: totalHours,
    lastName: ""
  }];

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

  return (
    <div className={`${darkMode ? 'text-light' : ''} w-100`}>
      <div 
        className={`${darkMode ? 'text-light' : ''} w-100`}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'auto',
          flexDirection: isTablet ? 'column' : 'row',
          width: '100%',
          marginBottom: '16px',
          padding: 0,
          backgroundColor: 'transparent',
          marginTop: '15px',
        }}
      >
        <h4 style={{ fontSize: isSmallMobile ? '16px' : isMobile ? '18px' : 'inherit' }}>Pie Charts</h4>
      </div>
      <div><h5>{projectName}</h5></div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: isMobile ? 'flex-start' : 'center',
          overflow: 'auto',
          flexDirection: isTablet ? 'column' : 'row',
          width: '100%',
          marginBottom: '16px',
          padding: isTablet ? '0 10px' : 0,
          backgroundColor: 'transparent',
        }}
      >
        <div>
        <label
          className={darkMode ? 'text-light' : ''}
          style={{
            paddingRight: isMobile ? '0.5rem' : '1rem',
            fontSize: isSmallMobile ? '11px' : isMobile ? '12px' : '14px',
            display: isMobile ? 'block' : 'inline',
            marginBottom: isMobile ? '8px' : 0,
          }}
        >
            {isChecked ? 'All-Time Total Hours by All Member (Hide PieChart)' : 'All-Time Total Hours by Member (Show PieChart)'}
        </label>
          <input
            type="checkbox"
            style={{
              marginLeft: isMobile ? 0 : '8px',
              transform: isMobile ? 'scale(1.1)' : 'none',
            }}
            checked={isChecked}
            onChange={handleShowPieChart}
          />
        </div>

        {isChecked && ( <div style={{textAlign:'left', margin:'auto'}}>
        <p className={darkMode ? 'text-light' : 'blue'} style={{textAlign:'center'}}>{showMembers === null ? 'All members' : ''}</p>
        <div style={{ width: '100%' }}>
        <div 
          style={{ 
            wordBreak: 'keep-all', 
            color: darkMode ? 'white' : '',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : 0,
            padding: isMobile ? '10px 0' : 0,
          }}
          className={`d-flex align-items-center justify-content-between ${style.switchContainer}`}>
          <p className={darkMode ? 'text-light' : 'blue'} style={{ fontSize: isMobile ? '12px' : 'inherit', margin: isMobile ? 0 : 'inherit' }}>Inactive Members</p>
          <div className="pr-2">
            <TriMembersStateToggleSwitch
              value={showMembers}
              onChange={handleShowMembersChange}
            />
          </div>
          <p className={darkMode ? 'text-light' : 'green'} style={{ fontSize: isMobile ? '12px' : 'inherit', margin: isMobile ? 0 : 'inherit' }}>Active Members</p>
        </div>
        </div>
          <p className={darkMode ? 'text-light' : 'blue'} style={{ fontWeight: 'bold', fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '13px', marginBottom: isMobile ? '0.2rem' : '0.25rem' }}>
            Total Active Members: {activeData.length}
            <span> - Hrs Applied: {globalactiveHours.toFixed(2)}</span>
          </p>
          <p className={darkMode ? 'text-light' : 'blue'} style={{fontWeight:'bold', fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '13px', marginBottom: isMobile ? '0.2rem' : '0.25rem'}}>Total Inactive Members: {inactiveData.length} <span> - Hrs Applied: { globalInactiveHours.toFixed(2) } </span> </p>
          <p className={darkMode ? 'text-light' : 'blue'} style={{fontWeight:'bold', fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '13px', marginBottom: isMobile ? '0.2rem' : '0.25rem'}}>Total Applied Hours: {totalHours.toFixed(2)} </p>
          <p className={darkMode ? 'text-light' : 'blue'} style={{fontWeight:'bold', fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '13px', marginBottom: isMobile ? '0.2rem' : '0.25rem'}}>Total Members:  {mergedProjectUsersArray.length}</p>
        </div>)}

      </div>
        {isChecked && (<div style={{ width: '100%', height: windowSize.width <= 400 ? '22rem' : windowSize.width <= 576 ? '26rem' : '32rem' }}>
        <ProjectPieChart userData={totalHours > 0 ? userData : noDataPlaceholder} windowSize={windowSize.width} darkMode={darkMode} />
      </div>)}

    </div>
  )  
}  
import React, {  useEffect, useState } from 'react';
import { ProjectPieChart } from '../ProjectPieChart/ProjectPieChart';
import '../PiechartByProject/PieChartByProject.css';

export function WbsPieChart({
  projectMembers,
  projectName,
  darkMode
}) {
  const [userData, setUserData] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [inactiveData, setInactiveData] = useState([]);
  const [activeData, setActiveData] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [globalInactiveHours, setGlobalInactiveHours] = useState(0);

  useEffect(() => {
    const totalUsers = projectMembers.foundUsers;
    const totalHoursCalculated = totalUsers.reduce((acc, curr) => {
      return ((acc + curr.weeklycommittedHours));
    }, 0);
    setTotalHours(totalHoursCalculated);
    const activeUsers = totalUsers.filter(member => member.isActive )
    setActiveData(activeUsers);
    const arrData = totalUsers.map(member => {
      const data = {
        name: `${member.firstName} ${member.lastName}`,
        value: member.weeklycommittedHours,
        projectName,
        totalHoursCalculated,
        lastName: member.lastName
      }
      return data
    })


    if (showInactive === true) {
      const inactiveUsers = projectMembers.foundUsers.filter(member => !member.isActive )
      setInactiveData(inactiveUsers);

      const totalHoursInactive = inactiveUsers.reduce((acc, curr) => {
        return ((acc + curr.weeklycommittedHours));
      }, 0);
      setGlobalInactiveHours(totalHoursInactive);

      const inactiveArr = inactiveData.map(member => {
        const data = {
          name: `${member.firstName} ${member.lastName}`,
          value: member.weeklycommittedHours,
          projectName,
          totalHoursCalculated:  totalHoursInactive,
          lastName: member.lastName
        }
        return data;
      })
      const sortedArr = inactiveArr.sort((a, b) => (a.name).localeCompare(b.name))
      setUserData(sortedArr)
    } else {
      const sortedArr = arrData.sort((a, b) => (a.name).localeCompare(b.name))
      setUserData(sortedArr)
    }

  }, [projectMembers,showInactive ])

  useEffect(() => {
    window.addEventListener('resize', updateWindowSize);
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    };
  }, []);

  const updateWindowSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  const handleShowPieChart = () => {
    setIsChecked(!isChecked);
  };

  const noDataPlaceholder = [{
    name: "No Data",
    value: 1/1000,
    projectName: projectName,
    totalHoursCalculated: 0,
    lastName: ""
  }];

  return (
    <div className={darkMode ? 'text-light' : ''}>
      <div><h5> Owners, Managers and Admins in {projectName} </h5></div>
      <div className= "pie-chart-title" >
        <div>
          <label style={{
            paddingRight: '1rem'
          }}>{isChecked ? 'Weekly Commited Hours By Active Member(Hide Piechart)' : 'Weekly Commited Hours By Member(Show Piechart)'}</label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleShowPieChart}
          />

        </div>
      </div>
      {isChecked && ( <div style={{textAlign:'left', marginLeft:'35%'}}>
          <p style={{fontWeight:'bold'}}>Total Active Members:  {activeData.length}  </p>
          <p style={{fontWeight:'bold'}}>Total Hours Commited: { totalHours.toFixed(2)} </p>

      </div>)}
      {isChecked && (<div style={{ width: '100%', height: '32rem' }}>
        <ProjectPieChart userData={totalHours > 0 ? userData : noDataPlaceholder} windowSize={windowSize.width} darkMode={darkMode}/>
      </div>)}
    </div>
  )
}


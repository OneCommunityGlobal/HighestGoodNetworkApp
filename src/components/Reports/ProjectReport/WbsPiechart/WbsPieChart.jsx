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
  const [activeData, setActiveData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);

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
    const sortedArr = arrData.sort((a, b) => (a.name).localeCompare(b.name))
    setUserData(sortedArr)


  }, [projectMembers])

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
    <div className={darkMode ? "text-light" : ""}>
      <h5> Owners, Managers and Admins in {projectName} </h5>
      <div className= "pie-chart-title" >
        <div>
          <label className={`${darkMode ? 'text-light' : ''} pr-4`} >{isChecked ? 'Weekly Commited Hours By Active Member(Hide Piechart)' : 'Weekly Commited Hours By Member(Show Piechart)'}</label>
          <input
            type="checkbox"
            // className="pie-chart-checkbox"
            checked={isChecked}
            onChange={handleShowPieChart}
          />
        </div>
      {isChecked && ( 
        <div style={{ textAlign: 'left', margin: 'auto' }}>
          <div style={{ textAlign: 'center' }}>
          <p style={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold' }} className="fw-bold">Total Active Members:  {activeData.length}  </p>
          <p style={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold' }} className="fw-bold mb-0">Total Hours Commited: { totalHours.toFixed(2)} </p>
          </div>
      </div>)}
      </div>
      {isChecked && (<div style={{ width: '100%', height: '32rem' }}>
        <ProjectPieChart userData={totalHours > 0 ? userData : noDataPlaceholder} windowSize={windowSize.width} darkMode={darkMode}/>
      </div>)}
    </div>
  )
}


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
  return (
    <div className={darkMode ? "text-light" : ""}>
      <h5> Owners, Managers and Admins in {projectName} </h5>
      <div className= "pie-chart-title" >
        <div className= { darkMode ? 'text-light' : ''}>
          <label className={`${darkMode ? 'text-light' : ''} pr-4`} >{isChecked ? 'Weekly Commited Hours By Active Member(Hide Piechart)' : 'Weekly Commited Hours By Member(Show Piechart)'}</label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleShowPieChart}
          />

        </div>
      </div>
      {isChecked && ( <div style={{textAlign:'left', marginLeft:'35%'}}>
          <p className="fw-bold">Total Active Members:  {activeData.length}  </p>
          <p className="fw-bold mb-0">Total Hours Commited: { totalHours.toFixed(2)} </p>

      </div>)}
      {isChecked && (<div style={{ width: '100%', height: '32rem' }}>
        <ProjectPieChart userData={userData} windowSize={windowSize.width} darkMode={darkMode}/>
      </div>)}
    </div>
  )
}


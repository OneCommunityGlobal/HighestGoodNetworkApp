import React, { PureComponent, useEffect, useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';
import './PieChartByProject.css';

export function PieChartByProject({
  mergedProjectUsersArray,
  projectName,
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
    // const totalUsers = mergedProjectUsersArray.length > 0 ? mergedProjectUsersArray.length : [];
    const totalHoursCalculated = mergedProjectUsersArray.reduce((acc, curr) => {
      return ((acc + curr.totalSeconds));
    }, 0) / 3600;
    setTotalHours(totalHoursCalculated);
    const activeUsers = mergedProjectUsersArray.filter(member => member.personId.isActive )
      setActiveData(activeUsers);

    const arrData = mergedProjectUsersArray.map(member => {
      const data = {
        name: `${member.personId.firstName} ${member.personId.lastName}`,
        value: member.totalSeconds/3600,
        projectName,
        totalHoursCalculated,
        lastName: member.personId.lastName
      }
      return data
    });


    if (showInactive === true) {
      const inactiveUsers = mergedProjectUsersArray.filter(member => !member.personId.isActive )
      setInactiveData(inactiveUsers);

      const totalHoursInactive = inactiveUsers.reduce((acc, curr) => {
        return ((acc + curr.totalSeconds));
      }, 0) / 3600;
      setGlobalInactiveHours(totalHoursInactive);

      const inactiveArr = inactiveData.map(member => {
        const data = {
          name: `${member.personId.firstName} ${member.personId.lastName}`,
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
    else {
      const sortedArr = arrData.sort((a, b) => (a.name).localeCompare(b.name))
      setUserData(sortedArr)
    }

  }, [mergedProjectUsersArray,showInactive ])

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
    <div>
      <div className='pie-chart-title'><h4>PieCharts</h4></div>
      <div><h5>{projectName}</h5></div>
      <div className= "pie-chart-container" >
        <div>
          <label style={{
            paddingRight: '1rem'
          }}>{isChecked ? 'All-Time Total Hours by All Member (Hide Pie Chart)' : 'All-Time Total Hours by Member (Show PieChart)'}</label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleShowPieChart}
          />

        </div>
        {isChecked && ( <div style={{textAlign:'left'}}>
        <label style={{marginRight:'1rem'}}>{showInactive ? ' Show only Inactive Members ':' Show only Inactive Members ' }</label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={() => setShowInactive(!showInactive)}
          />
          <p style={{fontWeight:'bold'}}>Total Active Members:  {activeData.length}  <span> - Hrs Aplied: { totalHours.toFixed(2)- globalInactiveHours.toFixed(2) } </span> </p>
          <p style={{fontWeight:'bold'}}>Total Inactive Members: {inactiveData.length} <span> - Hrs Aplied: { globalInactiveHours.toFixed(2) } </span> </p>
          <p style={{fontWeight:'bold'}}>Total Aplied Hours: {totalHours.toFixed(2)} </p>
          <p style={{fontWeight:'bold'}}>Total Members:  {mergedProjectUsersArray.length}</p>
        </div>)}
      </div>
        {isChecked && (<div style={{ width: '100%', height: '32rem' }}>
        <ProjectPieChart userData={userData} windowSize={windowSize.width} />
      </div>)}
    </div>
  )
}


const generateRandomHexColor = () => {
  // Generate a random hex color code
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const hexColor = "#" + "0".repeat(6 - randomColor.length) + randomColor;

  return hexColor;
}


const renderActiveShape = (props) => {
  const hexColor = generateRandomHexColor()
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';


  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.lastName.substring(0, 5)} {payload.value.toFixed(1)} of {payload.totalHoursCalculated.toFixed(1)}hrs
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={hexColor}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={hexColor}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name.substring(0, 14)}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`${value.toFixed(2)} Hours (${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export class ProjectPieChart extends PureComponent {

  state = {
    activeIndex: 0,
    displayDetails: false,
  };

  onPieEnter = (_, index) => {
    this.setState(prevState => ({
      ...prevState,
      activeIndex: index,
    }));
  };


  render() {
    const { userData, windowSize } = this.props;
    let circleSize = 30;
    if (windowSize <= 1280) {
      circleSize = windowSize / 10 * 0.5;
    }

    return (
      <>
        <ResponsiveContainer maxWidth={640} maxHeight={640} minWidth={350} minHeight={350}>
          <PieChart>
            <Pie
              activeIndex={this.state.activeIndex}
              activeShape={renderActiveShape}
              data={userData}
              cx="50%"
              cy="50%"
              innerRadius={60 + circleSize}
              outerRadius={120 + circleSize}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={this.onPieEnter}
            />
          </PieChart>
        </ResponsiveContainer>
      </>
    );
  }
}

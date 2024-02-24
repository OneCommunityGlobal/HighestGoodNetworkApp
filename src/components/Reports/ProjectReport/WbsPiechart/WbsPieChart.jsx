
import React, { PureComponent, useEffect, useState} from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';


export function WbsPieChart ({
  projectMembers,
  projectName
}) {
  const [userData, setUserData] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    const totalUsers = projectMembers.foundUsers
    const totalHours = totalUsers.reduce((acc, member) => {
      return acc + member.weeklycommittedHours;
    }, 0)
     const arrData = totalUsers.map(member => {
      let data = {
        name: `${member.firstName} ${member.lastName}`,
        value:  member.weeklycommittedHours,
        projectName,
        totalHours,
        lastName: member.lastName
      }
      return data;
    })
    setUserData(arrData)
  },[projectMembers])

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
          <div style={{
            display: 'flex',
            justifyContent:'space-between',
            alignItems:'center',
            backgroundColor:'white'
          }}>
            <div><h4>{projectName}</h4></div>
            <div>
              <label style={{
                paddingRight:'1rem'
              }}>{isChecked ? 'Hide Piechart' :'Show Piechart'}</label>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleShowPieChart}
              />
            </div>
          </div>  
         {isChecked && ( <div style={{ width: '100%', height: '32rem'}}>
          <Example userData={userData} windowSize={windowSize.width}/>
        </div>)}
      </div>
    )
}

const generateRandomHexColor = () => {
    // Generate a random hex color code
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
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
         {payload.lastName} {payload.value} of {payload.totalHours}hrs
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
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${value} Hours (${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  export class Example extends PureComponent {

    state = {
      activeIndex: 0,
      displayDetails:false,
    };
  
    onPieEnter = (_, index) => {
      this.setState(prevState => ({
        ...prevState,
        activeIndex: index,
      }));
    };

   
    render() {
        const {userData,windowSize} = this.props;
        let circleSize = 30;
        if (windowSize <= 1280) {
          circleSize = windowSize/10 * 0.5;
        }

      return (
        <>
           <ResponsiveContainer  maxWidth={640} maxHeight={640} minWidth={350} minHeight={350}>
            <PieChart>
                <Pie
                activeIndex={this.state.activeIndex}
                activeShape={renderActiveShape}
                data={userData}
                cx="50%"
                cy="50%"
                innerRadius={60 + circleSize }
                outerRadius={120 + circleSize}
                fill= "#8884d8"
                dataKey="value"
                onMouseEnter={this.onPieEnter}
                />
            </PieChart>
        </ResponsiveContainer>
        </>
      );
    }
  }
  

  


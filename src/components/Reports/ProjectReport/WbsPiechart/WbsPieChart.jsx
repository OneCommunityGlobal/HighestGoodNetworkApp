import { Chart } from "react-google-charts";

import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';

export const WbsPieChart = () => {
    return (
        <div style={{
            height:'330px',
            border:"1px solid gray"
        }}>
            <h1>Add stuff</h1>
            <Example />
        </div>
    )
}
const generateRandomHexColor = () => {
    // Generate a random hex color code
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
  
    // Ensure the color has six digits by padding with zeros if needed
    const hexColor = "#" + "0".repeat(6 - randomColor.length) + randomColor;
  
    return hexColor;
  }
  
  
const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
  ];
  
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
          {payload.name}
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
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };
  
  export default class Example extends PureComponent {

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

    onClickSlice = (_, index) => {
        this.setState(prevState => ({
            ...prevState,
            displayDetails: !this.state.displayDetails,
          }));
    }

  
    render() {
        console.log(this.state)
      return (
            <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={400}>
            <Pie
              activeIndex={this.state.activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill= "#8884d8"
              dataKey="value"
              onMouseEnter={this.onPieEnter}
              onClick = {this.onClickSlice}
            />
          </PieChart>
        </ResponsiveContainer>
    
      );
    }
  }
  





// export const data = [
//   ["Language", "Speakers (in millions)"],
//   ["Assamese", 13],
//   ["Bengali", 83],
//   ["Bodo", 1.4],
//   ["Dogri", 2.3],
//   ["Gujarati", 46],
//   ["Hindi", 300],
//   ["Kannada", 38],
//   ["Kashmiri", 5.5],
//   ["Konkani", 5],
//   ["Maithili", 20],
//   ["Malayalam", 33],
//   ["Manipuri", 1.5],
//   ["Marathi", 72],
//   ["Nepali", 2.9],
//   ["Oriya", 33],
//   ["Punjabi", 29],
//   ["Sanskrit", 0.01],
//   ["Santhali", 6.5],
//   ["Sindhi", 2.5],
//   ["Tamil", 61],
//   ["Telugu", 74],
//   ["Urdu", 52],
// ];

// export const options = {
//   title: "Indian Language Use",
//   legend: "none",
//   pieSliceText: "label",
//   slices: {
//     4: { offset: 0.2 },
//     12: { offset: 0.3 },
//     14: { offset: 0.4 },
//     15: { offset: 0.5 },
//   },
// };

// const MyChart = ()  => {
//   return (
//     <Chart
//       chartType="PieChart"
//       data={data}
//       options={options}
//       width={"100%"}
//       height={"400px"}
//     />
//   );
// }

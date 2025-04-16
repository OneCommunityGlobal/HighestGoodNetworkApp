import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { month: 'Jan 2021', predictedCost: 250, actualCost: 460 },
  { month: 'Mar 2021', predictedCost: 750, actualCost: 900 },
  { month: 'May 2021', predictedCost: 1000, actualCost: 1100 }
];

const CostPredictionChart = () => {
  return (
    <div style={{ width: '100%', height: '100%', padding: '20px' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '40px', 
        fontSize: '24px',
        fontWeight: 'normal'
      }}>
        Predicted Cost and Actual Cost
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#666' }}
            tickSize={10}
          />
          <YAxis 
            tick={{ fill: '#666' }}
            tickSize={10}
            domain={[0, 2800]}
            ticks={[0, 700, 1400, 2100, 2800]}
          />
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          <Line
            type="monotone"
            dataKey="predictedCost"
            stroke="#8884d8"
            strokeWidth={2}
            name="Predicted Cumulative"
            dot={{ r: 4, fill: '#8884d8' }}
            label={{
              fill: '#666',
              fontSize: 12,
              position: 'top',
              dy: -10
            }}
          />
          <Line
            type="monotone"
            dataKey="actualCost"
            stroke="#ff0000"
            strokeWidth={2}
            name="Actual Cost"
            dot={{ r: 4, fill: '#ff0000' }}
            label={{
              fill: '#666',
              fontSize: 12,
              position: 'top',
              dy: -10
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostPredictionChart; 
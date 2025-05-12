import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import projectCostService from '../../../services/projectCostService';

function CostPredictionChart({ projectId }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both costs and predictions
        const [costsResponse, predictionsResponse] = await Promise.all([
          projectCostService.getProjectCosts(projectId),
          projectCostService.getProjectPredictions(projectId),
        ]);

        // Combine costs and predictions data
        const costsData = costsResponse.data.costs;
        const predictionsData = predictionsResponse.data.predictions;

        // Create a map of predictions by month
        const predictionsMap = predictionsData.reduce((acc, pred) => {
          acc[pred.month] = pred.predictedCost;
          return acc;
        }, {});

        // Combine the data
        const combinedData = costsData.map(cost => ({
          ...cost,
          predictedCost: predictionsMap[cost.month] || null,
        }));

        setChartData(combinedData);
        setError(null);
      } catch (err) {
        // console.error('Error fetching project costs:', err);
        setError('Failed to load project cost data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (loading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get current month for reference line
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ width: '100%', height: '100%', padding: '20px' }}>
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '24px',
          fontWeight: 'normal',
        }}
      >
        Project Cost Analysis
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="month" tick={{ fill: '#666' }} tickSize={10} />
          <YAxis tick={{ fill: '#666' }} tickSize={10} domain={[0, 'auto']} />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <ReferenceLine 
            x={currentMonth} 
            stroke="#ff0000" 
            strokeDasharray="3 3" 
            label={{ 
              value: 'Current Month', 
              position: 'top',
              fill: '#ff0000',
            }}
          />
          <Line
            type="monotone"
            dataKey="plannedCost"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Planned Cost"
            dot={{ r: 4, fill: '#82ca9d' }}
          />
          <Line
            type="monotone"
            dataKey="actualCost"
            stroke="#8884d8"
            strokeWidth={2}
            name="Actual Cost"
            dot={{ r: 4, fill: '#8884d8' }}
          />
          <Line
            type="monotone"
            dataKey="predictedCost"
            stroke="#ff7300"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Predicted Cost"
            dot={{ r: 4, fill: '#ff7300' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostPredictionChart;

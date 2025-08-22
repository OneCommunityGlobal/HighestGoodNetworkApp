import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import httpService from '../../../services/httpService';

const COLORS = {
  equipmentIssues: '#4F81BD', // blue
  laborIssues: '#C0504D', // red
  materialIssues: '#F3C13A', // yellow
};

export default function IssuesBreakdownChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/issues/breakdown`,
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch issue statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div
      style={{
        boxSizing: 'border-box',
        position: 'relative',
        width: '100%',
        maxWidth: '1400px',
        margin: '32px auto',
        background: '#fafbfc',
        borderRadius: 18,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            width: '100%',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              textAlign: 'left',
              margin: 0,
              fontSize: 36,
              fontWeight: 400,
              color: '#888',
              marginBottom: 16,
            }}
          >
            Issues breakdown by Type
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                backgroundColor: '#4F81BD',
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <span style={{ color: '#666', fontSize: 22 }}>Equipment Issues</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                backgroundColor: '#C0504D',
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <span style={{ color: '#666', fontSize: 22 }}>Labor Issues</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                width: 22,
                height: 22,
                backgroundColor: '#F3C13A',
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            <span style={{ color: '#666', fontSize: 22 }}>Materials Issues</span>
          </span>
        </div>
      </div>
      <div style={{ width: '100%', height: '500px', marginTop: '20px' }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="projectName" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="equipmentIssues" name="Equipment Issues" fill={COLORS.equipmentIssues}>
              <LabelList dataKey="equipmentIssues" position="top" />
            </Bar>
            <Bar dataKey="laborIssues" name="Labor Issues" fill={COLORS.laborIssues}>
              <LabelList dataKey="laborIssues" position="top" />
            </Bar>
            <Bar dataKey="materialIssues" name="Materials Issues" fill={COLORS.materialIssues}>
              <LabelList dataKey="materialIssues" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

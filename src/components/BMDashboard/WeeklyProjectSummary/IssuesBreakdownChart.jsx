import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
import styles from './IssueBreakdownChart.module.css';

const COLORS = {
  equipmentIssues: '#4F81BD', // blue
  laborIssues: '#C0504D', // red
  materialIssues: '#F3C13A', // yellow
};

export default function IssuesBreakdownChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Get projects from Redux
  const reduxProjects = useSelector(state => state.bmProjects || state.allProjects?.projects || []);

  // Filter states
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState([]);

  // Available options states
  const [availableIssueTypes, setAvailableIssueTypes] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);

  const rootStyles = getComputedStyle(document.body);
  const textColor = rootStyles.getPropertyValue('--text-color') || '#666';
  const gridColor = rootStyles.getPropertyValue('--grid-color') || (darkMode ? '#444' : '#ccc');
  const tooltipBg = rootStyles.getPropertyValue('--section-bg') || '#fff';

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

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const response = await httpService.get(`${process.env.REACT_APP_APIENDPOINT}/issues/types`);
        if (response.data && response.data.issueTypes) {
          setAvailableIssueTypes(response.data.issueTypes);
        }
      } catch (err) {
        // Chart can work without issue types filter - set to empty array
        setAvailableIssueTypes([]);
      }
    };

    fetchIssueTypes();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // Use Redux store if available
      if (reduxProjects && reduxProjects.length > 0) {
        setAvailableProjects(reduxProjects);
        return;
      }

      // Fetch from API if not in Redux
      try {
        const response = await httpService.get(`${process.env.REACT_APP_APIENDPOINT}/projects`);
        if (response.data && Array.isArray(response.data)) {
          setAvailableProjects(response.data);
        }
      } catch (err) {
        // Chart can work without projects filter - set to empty array
        setAvailableProjects([]);
      }
    };

    fetchProjects();
  }, [reduxProjects]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No data available</div>;

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h2 className={styles.heading}>Issues breakdown by Type</h2>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span
              className={styles.legendBox}
              style={{ backgroundColor: COLORS.equipmentIssues }}
            />
            <span className={styles.legendLabel}>Equipment Issues</span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.laborIssues }} />
            <span className={styles.legendLabel}>Labor Issues</span>
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendBox} style={{ backgroundColor: COLORS.materialIssues }} />
            <span className={styles.legendLabel}>Materials Issues</span>
          </span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="projectName" tick={{ fill: textColor }} />
            <YAxis allowDecimals={false} tick={{ fill: textColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: 'none',
                borderRadius: '8px',
                color: textColor,
              }}
            />
            <Bar dataKey="equipmentIssues" name="Equipment Issues" fill={COLORS.equipmentIssues}>
              <LabelList dataKey="equipmentIssues" position="top" fill={textColor} />
            </Bar>
            <Bar dataKey="laborIssues" name="Labor Issues" fill={COLORS.laborIssues}>
              <LabelList dataKey="laborIssues" position="top" fill={textColor} />
            </Bar>
            <Bar dataKey="materialIssues" name="Materials Issues" fill={COLORS.materialIssues}>
              <LabelList dataKey="materialIssues" position="top" fill={textColor} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

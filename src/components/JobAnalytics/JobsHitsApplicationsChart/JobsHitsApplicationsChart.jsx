import { Fragment, useEffect, useState } from 'react';
import { fetchJobsHitsApplications } from '../../../actions/jobAnalytics/JobsHitsApplicationsActions';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, Brush } from 'recharts';
import styles from './JobsHitsApplicationsChart.module.css';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

export const JobsHitsApplicationsChart = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleAssigned, setRoleAssigned] = useState(false);

  const { loading, data, error } = useSelector(state => state.jobsHitsApplications);
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (selectedRoles.length > 0) {
      const roles = selectedRoles.map(role => role.value).join(',');
      queryParams.append('roles', roles);
    }
    dispatch(fetchJobsHitsApplications(queryParams.toString(), token));
  }, [startDate, endDate, selectedRoles, dispatch, token]);

  useEffect(() => {
    if (data && data.length > 0 && !roleAssigned) {
      setRoleOptions(
        data.map(item => {
          return {
            value: item.role,
            label: item.role,
          };
        }, setRoleAssigned(true)),
      );
    }
  }, [loading, error, data]);

  const CustomYAxisNames = ({ x, y, payload }) => {
    const text = payload.value;
    const truncated = text.split(' ').slice(0, 2);

    return (
      <g transform={`translate(${x},${y})`}>
        {truncated.map((line, index) => (
          <text
            key={index}
            x={0}
            y={0}
            dy={index * 14 - (truncated.length - 1) * 7}
            textAnchor="end"
            fill="#666"
            fontSize={12}
          >
            <title>{text}</title>
            {line}
          </text>
        ))}
      </g>
    );
  };

  const handleStartDateChange = date => {
    if (endDate && date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    if (startDate && date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  };

  const handleResetDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Fragment>
      <div className={`${styles.mainContainer} ${darkMode ? styles.bgOxfordBlue : ''}`}>
        <h4 className={darkMode ? styles.colorWhite : ''}>Role-wise Hits and Applications</h4>
        <div className={styles.filterContainer}>
          <div className={styles.dateFilter}>
            <div className={styles.dateReset}>
              {startDate || endDate ? (
                <button
                  onClick={handleResetDates}
                  className={`${styles.resetBtn} ${darkMode ? styles.resetBtnDark : ''}`}
                >
                  Reset Dates
                </button>
              ) : (
                <button
                  className={`${styles.resetBtn} ${darkMode ? styles.resetBtnDark : ''}`}
                  disabled
                >
                  Reset Dates
                </button>
              )}
            </div>
            <div className={styles.startDate}>
              <label
                htmlFor="start-date"
                className={`${styles.dateName} ${darkMode ? styles.colorWhite : ''}`}
              >
                Start Date:
              </label>
              <DatePicker
                id="start-date"
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className={`${styles.datePicker} ${darkMode ? styles.bgYinmnBlue : ''}`}
              />
            </div>
            <div className={styles.endDate}>
              <label
                htmlFor="end-date"
                className={`${styles.dateName} ${darkMode ? styles.colorWhite : ''}`}
              >
                End Date:
              </label>
              <DatePicker
                id="end-date"
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className={styles.datePicker}
              />
            </div>
          </div>

          <div className={`${styles.roleFilter}`}>
            <div className={styles.roleFilterContainer}>
              <label htmlFor="role-select" className={darkMode ? styles.colorWhite : ''}>
                Roles:
              </label>
              <Select
                id="role-select"
                isMulti
                options={roleOptions}
                onChange={setSelectedRoles}
                placeholder="Select Roles"
                className={styles.roleSelector}
              />
            </div>
          </div>
        </div>
        <div className={styles.chartContainer}>
          {loading && <div className={`${styles.spinner}`}>Loading...</div>}
          {error && <div className={`${styles.errorMessage}`}>Issue getting the data</div>}
          {!loading && !error && data.length === 0 && (
            <div className={`${styles.emptyMessage}`}>
              No data available for the selected filters.
            </div>
          )}
          {!loading && !error && data.length > 0 && (
            <ResponsiveContainer className={styles.chart} width="70%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 20, right: 30, left: 65, bottom: 20 }}
              >
                <XAxis
                  type="number"
                  label={{
                    value: 'Number of Hits/Applications',
                    position: 'bottom',
                    style: {
                      fill: darkMode ? styles.colorWhite : '',
                    },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="role"
                  label={{
                    value: 'Roles',
                    position: 'top',
                    style: {
                      fill: darkMode ? styles.colorWhite : '',
                    },
                  }}
                  tick={<CustomYAxisNames />}
                />
                <Bar dataKey="hits" fill="#8884d8" activeBar={false} isAnimationActive={false} />
                <Bar
                  dataKey="applications"
                  fill="#82ca9d"
                  activeBar={false}
                  isAnimationActive={false}
                />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Legend verticalAlign="top" align="center" />

                {data.length > 7 && (
                  <Brush
                    dataKey="role"
                    height={20}
                    stroke="#8884d8"
                    startIndex={0}
                    endIndex={7}
                    y={480}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Fragment>
  );
};

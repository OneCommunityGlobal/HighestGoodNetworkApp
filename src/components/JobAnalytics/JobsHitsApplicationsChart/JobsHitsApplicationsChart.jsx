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

  const CustomYAxisNames = ({ x, y, payload, darkMode }) => {
    const text = payload.value;
    const extractedRole = text
      .split('-')
      .slice(0, 1)[0]
      .trim();
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} textAnchor="end" fill={darkMode ? '#ffffff' : '#000000'} fontSize={12}>
          <title>{text}</title>
          {extractedRole.length > 35 ? `${extractedRole.slice(0, 32)}...` : extractedRole}
        </text>
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
                className={`${styles.datePicker} ${darkMode ? styles.bgSpaceCadet : ''}`}
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
                className={`${styles.datePicker} ${darkMode ? styles.bgSpaceCadet : ''}`}
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
                className={styles.roleSelector}
                styles={{
                  control: base => ({
                    ...base,
                    backgroundColor: darkMode ? '#1C2541' : 'white',
                    color: darkMode ? 'white' : 'black',
                    borderColor: darkMode ? '#3A506B' : base.borderColor,
                  }),

                  menu: base => ({
                    ...base,
                    backgroundColor: darkMode ? '#1C2541' : 'white',
                  }),

                  option: (base, state) => ({
                    ...base,
                    backgroundColor: darkMode
                      ? state.isFocused
                        ? '#3A506B' // hover color (FIX)
                        : '#1C2541'
                      : state.isFocused
                      ? '#eee'
                      : 'white',
                    color: darkMode ? 'white' : 'black', // FIX: always readable
                  }),

                  multiValue: base => ({
                    ...base,
                    backgroundColor: darkMode ? '#3A506B' : base.backgroundColor,
                  }),

                  multiValueLabel: base => ({
                    ...base,
                    color: 'white', // FIX: text inside selected tags
                  }),

                  multiValueRemove: base => ({
                    ...base,
                    color: 'white',
                    ':hover': {
                      backgroundColor: '#5BC0BE',
                      color: 'black',
                    },
                  }),

                  singleValue: base => ({
                    ...base,
                    color: darkMode ? 'white' : 'black',
                  }),

                  input: base => ({
                    ...base,
                    color: darkMode ? 'white' : 'black',
                  }),

                  placeholder: base => ({
                    ...base,
                    color: darkMode ? '#ccc' : '#666',
                  }),
                }}
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
            <ResponsiveContainer className={styles.chart} width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                barCategoryGap="40%"
                barGap={4}
                margin={{ top: 20, right: 30, left: 65, bottom: 20 }}
              >
                <Bar
                  dataKey="hits"
                  fill="#8884d8"
                  activeBar={false}
                  isAnimationActive={false}
                  barSize={14}
                />
                <Bar
                  dataKey="applications"
                  fill="#82ca9d"
                  activeBar={false}
                  isAnimationActive={false}
                  barSize={14}
                />
                <XAxis
                  type="number"
                  tick={{ fill: darkMode ? '#ffffff' : '#000000' }}
                  label={{
                    value: 'Number of Hits/Applications',
                    position: 'bottom',
                    style: {
                      fill: darkMode ? '#ffffff' : '#000000',
                    },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="role"
                  width={200}
                  label={{
                    value: 'Roles',
                    position: 'bottom',
                    style: {
                      fill: darkMode ? '#ffffff' : '#000000',
                    },
                  }}
                  tick={<CustomYAxisNames darkMode={darkMode} />}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2541' : '#fff',
                    border: darkMode ? '1px solid #3A506B' : '1px solid #ccc',
                    color: darkMode ? '#fff' : '#000',
                  }}
                  itemStyle={{
                    color: darkMode ? '#fff' : '#000',
                  }}
                  labelStyle={{
                    color: darkMode ? '#fff' : '#000',
                  }}
                />
                <Legend verticalAlign="top" align="center" />

                {data.length > 7 && (
                  <Brush
                    dataKey="role"
                    height={20}
                    // stroke={darkMode ? '#5BC0BE' : '#8884d8'} // border/line
                    startIndex={0}
                    endIndex={7}
                    y={480}
                    travellerWidth={10}
                    tickFormatter={value => value}
                    fill={darkMode ? '#1C2541' : '#fff'}
                    traveller={{
                      stroke: darkMode ? '#5BC0BE' : '#8884d8',
                      fill: darkMode ? '#5BC0BE' : '#8884d8',
                    }}
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

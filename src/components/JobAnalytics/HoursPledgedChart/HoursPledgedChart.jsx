import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import './HoursPledgedChart.css';

const mockData = [
    { role: 'Developer', avgHours: 25 },
    { role: 'Designer', avgHours: 15 },
    { role: 'Manager', avgHours: 30 },
    { role: 'Tester', avgHours: 20 },
];

function HoursPledgedChart() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const darkMode = useSelector(state => state.theme.darkMode);

    const roleOptions = mockData.map((item) => ({ value: item.role, label: item.role }));

    useEffect(() => {
        setLoading(true);
        setError(null);

        setTimeout(() => {
            try {
                setData(mockData);
                setFilteredData(mockData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        }, 1000); 
    }, []);

    useEffect(() => {
        if (!loading && !error) {
            let updatedData = [...data];

            if (selectedRoles.length > 0) {
                const selectedRoleNames = selectedRoles.map((role) => role.value);
                updatedData = updatedData.filter((item) => selectedRoleNames.includes(item.role));
            }

            updatedData.sort((a, b) => b.avgHours - a.avgHours);

            setFilteredData(updatedData);
        }
    }, [selectedRoles, data, loading, error]);

    return (
        <div className={`hours-pledged-chart ${darkMode ? 'dark-mode' : ''}`}>
            <h2>Average Number of Hours/Week Pledged by Role</h2>

            {loading && <div className="spinner">Loading...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && filteredData.length === 0 && (
                <div className="empty-message">No data available for the selected filters.</div>
            )}

            {!loading && !error && filteredData.length > 0 && (
                <>
                    <div className="filters">
                        <div className="date-filter">
                            <label>Date Range:</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Start Date"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="End Date"
                            />
                        </div>

                        <div className="role-filter">
                            <label>Roles:</label>
                            <Select
                                isMulti
                                options={roleOptions}
                                onChange={setSelectedRoles}
                                placeholder="Select Roles"
                            />
                        </div>
                    </div>
                    <div className="chart-container">
                        <BarChart
                            width={600}
                            height={400}
                            data={filteredData}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="avgHours" />
                            <YAxis type="category" dataKey="role" />
                            <Tooltip />
                            <Bar dataKey="avgHours" fill={darkMode ? '#225163' : '#8884d8'}>
                                <LabelList dataKey="avgHours" position="right" />
                            </Bar>
                        </BarChart>
                    </div>
                </>
            )}
        </div>
    );
}

export default HoursPledgedChart;
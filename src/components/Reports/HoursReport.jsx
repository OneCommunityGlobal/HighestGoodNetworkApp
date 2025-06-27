import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button, Spinner } from 'reactstrap';
import moment from 'moment';

const formatOptions = (items, labelKey, valueKey) =>
  items.map(item => ({
    label: item[labelKey],
    value: item[valueKey],
  }));

const HoursReport = ({
  users,
  teams,
  projects,
  fetchHoursByPeople,
  fetchHoursByProjects,
  fetchHoursByTeams,
  startDate,
  endDate,
}) => {
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (type) => {
    setLoading(true);
    let response = [];
    const from = moment(startDate).toDate();
    const to = moment(endDate).toDate();

    if (type === 'people' && selectedPeople.length > 0) {
      const ids = selectedPeople.map(p => p.value);
      response = await fetchHoursByPeople(ids, from, to);
    }
    setReportData(response);
    setLoading(false);
  };

  return (
    <div className="hours-report">
      <h4>Generate Volunteer Hours Report</h4>

      <div className="mb-3">
        <label>Select People:</label>
        <Select
          isMulti
          options={formatOptions(users, 'firstName', '_id')}
          onChange={setSelectedPeople}
        />
        <Button className="mt-2" onClick={() => handleFetch('people')}>
          Generate People Report
        </Button>
      </div>


      {loading ? (
        <Spinner color="primary" />
      ) : (
        <div>
          <h5 className="mt-4">Report Results:</h5>
          {reportData.length === 0 ? (
            <p>No data found.</p>
          ) : (
            <ul>
              {reportData.map((entry, idx) => (
                <li key={idx}>
                  {entry.name || entry.projectName || entry.teamName}: {entry.totalHours} hours
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default HoursReport;

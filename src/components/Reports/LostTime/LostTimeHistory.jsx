import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import HistoryTable from './HistoryTable';

function LostTimeHistory(props) {

  const [entriesList, setEntriesList] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isOpen = props.isOpen;
  const type = props.type;
  const fromDate = props.startDate.toLocaleDateString('en-CA');
  const toDate = props.endDate.toLocaleDateString('en-CA');

  const idList = props.allData.map(data => data._id);

  useEffect(() => {
    loadLostTimeEntries(type, idList, fromDate, toDate).then(res => {
      setEntriesList(res);
      setDataLoading(false);
    });
  }, []);

  const reload = () => {
    setDataLoading(true);
    loadLostTimeEntries(type, idList, fromDate, toDate).then(res => {
      setEntriesList(res);
      setDataLoading(false);
    });
  }

  const alphabetize = timeEntries => {
    const temp = [...timeEntries];
    return temp.sort((a, b) =>
      `${a.name} ${a.date}`.localeCompare(`${b.name} ${b.date}`),
    );
  };

  const loadLostTimeEntries = async (type, idList, fromDate, toDate) => {
    let timeEntries = [];
    if(type == 'project') {
      let url = ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST;
      timeEntries = await axios
        .post(url, { projects: idList, fromDate, toDate })
        .then(res => {
          return res.data.map(entry => {
            return {
              _id: entry._id,
              dataId: entry.projectId,
              entryType: entry.entryType,
              name: entry.projectName,
              date: entry.dateOfWork,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
            };
          });
        });
    } else if(type == 'person') {
      let url = ENDPOINTS.TIME_ENTRIES_LOST_USER_LIST;
      timeEntries = await axios
        .post(url, { users: idList, fromDate, toDate })
        .then(res => {
          return res.data.map(entry => {
            return {
              _id: entry._id,
              dataId: entry.personId._id,
              entryType: entry.entryType,
              name: entry.firstName + ' ' + entry.lastName,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
              date: entry.dateOfWork,
            };
          });
        });
    } else {
      let url = ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST;
      timeEntries = await axios
        .post(url, { teams: idList, fromDate, toDate })
        .then(res => {
          return res.data.map(entry => {
            return {
              _id: entry._id,
              dataId: entry.teamId,
              entryType: entry.entryType,
              name: entry.teamName,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
              date: entry.dateOfWork,
            };
          });
        });
    }

    timeEntries = alphabetize(timeEntries);

    return timeEntries;
  };

  return (
      <div className="table-data-container mt-5">
        {isOpen && <HistoryTable 
          entriesList={entriesList}
          dataLoading={dataLoading}
          allData={props.allData}
          reload={reload}
        />}
      </div>
  );
}

export default LostTimeHistory;
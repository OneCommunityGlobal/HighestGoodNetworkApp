import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import Loading from 'components/common/Loading';
import EditHistoryModal from './EditHistoryModal';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';

function LostTimeHistory(props) {

  const [entriesRow, setEntriesRow] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const isOpen = props.isOpen;
  const type = props.type;
  const fromDate = props.startDate.toLocaleDateString('en-CA');
  const toDate = props.endDate.toLocaleDateString('en-CA');

  const idList = props.allData.map(data => data._id);
  const canEditTimeEntry = props.hasPermission('editTimeEntry');

  useEffect(() => {
    loadLostTimeEntries(type, idList, fromDate, toDate);
  }, []);

  const reload = () => {
    setDataLoading(true);
    loadLostTimeEntries(type, idList, fromDate, toDate);
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

    let entriesRow = [];
    if (timeEntries.length > 0) {
      entriesRow = timeEntries.map((entry) => (
        <tr id={`tr_${entry._id}`} key={entry._id}>
          <td>
            {entry.name}
          </td>
          <td>
            {entry.date}
          </td>
          <td>
            {entry.hours + ':' + entry.minutes}
          </td>
          <td>
            {entry.isTangible ? (
              <div className="isActive">
                <i className="fa fa-circle" aria-hidden="true" />
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true" />
              </div>
            )}
          </td>
          {canEditTimeEntry &&
            <td>
              <EditHistoryModal
                _id={entry._id}
                dataId={entry.dataId}
                dateOfWork={entry.date}
                hours={entry.hours}
                minutes={entry.minutes}
                isTangible={entry.isTangible}
                entryType={entry.entryType}
                allData={props.allData}
                reload={reload}
              />
            </td>
          }
        </tr>
      ));
    }

    setEntriesRow(entriesRow);
    setDataLoading(false);

  };

  return (
    <div className="table-data-container mt-5">
      {isOpen && (
        dataLoading? (
          <Loading/>
        ): (
          <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Date
              </th>
              <th scope="col">
                Time
              </th>
              <th scope="col">
                Tangible
              </th>
              {canEditTimeEntry && 
                <th scope="col">
                  Action
                </th>
              }
            </tr>
          </thead>
          <tbody>{entriesRow}</tbody>
        </table>
        )
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LostTimeHistory);
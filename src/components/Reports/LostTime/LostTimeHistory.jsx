import axios from 'axios';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';
import { boxStyle, boxStyleDark } from '~/styles';
import hasPermission from '~/utils/permissions';
import { connect } from 'react-redux';
import EditHistoryModal from './EditHistoryModal';

function LostTimeHistory(props) {
  const {darkMode} = props;

  const [entriesRow, setEntriesRow] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const {isOpen} = props;
  const {type} = props;
  const fromDate = props.startDate.toLocaleDateString('en-CA');
  const toDate = props.endDate.toLocaleDateString('en-CA');
  const idList = props.allData.map(data => data._id);

  const alphabetize = timeEntries => {
    const temp = [...timeEntries];
    return temp.sort((a, b) =>
      `${a.name} ${a.date}`.localeCompare(`${b.name} ${b.date}`),
    );
  };

  const loadLostTimeEntries = async (entryType, ids, startDate, endDate) => {
    let timeEntries = [];
    if(entryType === 'project') {
      const url = ENDPOINTS.TIME_ENTRIES_LOST_PROJ_LIST;
      timeEntries = await axios
        .post(url, { projects: ids, fromDate: startDate, toDate: endDate })
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
    } else if(entryType === 'person') {
      const url = ENDPOINTS.TIME_ENTRIES_LOST_USER_LIST;
      timeEntries = await axios
        .post(url, { users: ids, fromDate: startDate, toDate: endDate })
        .then(res => {
          return res.data.map(entry => {
            return {
              _id: entry._id,
              dataId: entry.personId._id,
              entryType: entry.entryType,
              name: `${entry.firstName  } ${  entry.lastName}`,
              hours: entry.hours,
              minutes: entry.minutes,
              isTangible: entry.isTangible,
              date: entry.dateOfWork,
            };
          });
        });
    } else if(entryType === 'team') {
      const url = ENDPOINTS.TIME_ENTRIES_LOST_TEAM_LIST;
      timeEntries = await axios
        .post(url, { teams: ids, fromDate: startDate, toDate: endDate })
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

    let newEntriesRow = [];
    if (timeEntries.length > 0) {
      newEntriesRow = timeEntries.map((entry) => (
        <tr id={`tr_${entry._id}`} key={entry._id}  className={darkMode ? 'hover-effect-reports-page-dark-mode text-light' : ''}>
          <td>
            {entry.name}
          </td>
          <td>
            {entry.date}
          </td>
          <td>
            {`${entry.hours  }:${  entry.minutes}`}
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
              // eslint-disable-next-line no-use-before-define
              reload={reload}
              darkMode={darkMode}
            />
          </td>
        </tr>
      ));
    }

    setEntriesRow(newEntriesRow);
    setDataLoading(false);

  };

  const reload = () => {
    setDataLoading(true);
    loadLostTimeEntries(type, idList, fromDate, toDate);
  }

  useEffect(() => {
    loadLostTimeEntries(type, idList, fromDate, toDate);
  }, []);
  
  useEffect(() => {
    reload();
  }, [darkMode])
  
  return (
    <div className="table-data-container mt-5">
      {isOpen && (
        dataLoading? (
          <Loading align="center" darkMode={darkMode}/>
        ): (
          <table 
          className={`table ${darkMode ? 'bg-yinmn-blue' : 'table-bordered'}`}
          style={darkMode ? boxStyleDark : boxStyle}>
          <thead>
            <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
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
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody className={darkMode ? 'dark-mode' : ''}>{entriesRow}</tbody>
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
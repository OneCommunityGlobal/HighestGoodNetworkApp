import moment from 'moment';
import React from 'react';
import { Table, Button } from 'react-bootstrap';
import hasPermission from '../../utils/permissions';
import { connect } from 'react-redux';
import { permissions } from 'utils/constants';
import { boxStyle, boxStyleDark } from 'styles';

/**
 * Shows the dates and times a user has edited their time entries. Admins are given the ability to delete these edits.
 * @param {*} props.userProfile
 * @param {function} props.setUserProfile
 * @returns
 */
const TimeEntryEditHistory = props => {
  const {darkMode, tabletView} = props;

  const editHistory = [...props.userProfile.timeEntryEditHistory].reverse();

  const canDeleteTimeEntry = props.hasPermission(permissions.timeLog.deleteTimeEntry) ;
 
  const secondsToHms = seconds => {
    let h = new String(Math.floor(seconds / 3600));
    let m = new String(Math.floor((seconds % 3600) / 60));
    let s = new String(Math.floor((seconds % 3600) % 60));
    if (h.length === 1) h = '0' + h;
    if (m.length === 1) m = '0' + m;
    if (s.length === 1) s = '0' + s;
    return `${h}:${m}:${s}`;
  };

  const deleteEdit = async id => {
    const newUserProfile = { ...props.userProfile };

    newUserProfile.timeEntryEditHistory = newUserProfile.timeEntryEditHistory.filter(
      item => item._id !== id,
    );

    props.setUserProfile(newUserProfile);
  };

  return (
    <>
      <p className='text-azure'>Time Entry Edit History</p>
      <table className={`table table-bordered ${darkMode ? 'text-light' : ''}`} width="100%">
        <thead>
          <tr style={tabletView ? {fontSize: "10px"} : {}}>
            <th className={darkMode ? 'bg-space-cadet p-2' : 'p-2'}>
              Date / Time
              <br />
              (Pacific Time)
            </th>
            <th className={darkMode ? 'bg-space-cadet' : ''}>
              Initial Time
              <br />
              (HH:MM:SS)
            </th>
            <th className={darkMode ? 'bg-space-cadet' : ''}>
              New Time
              <br />
              (HH:MM:SS)
            </th>
            {canDeleteTimeEntry && editHistory.length > 0 && <th className={darkMode ? 'bg-space-cadet' : ''}></th>}
          </tr>
        </thead>
        <tbody style={tabletView ? {fontSize: "10px"} : {}}>
          {editHistory.map(item => {
            return (
              <tr key={`edit-history-${item._id}`}>
                <td>
                  {moment(item.date)
                    .tz('America/Los_Angeles')
                    .format('YYYY-MM-DD hh:mm:ss')}
                </td>
                <td>{secondsToHms(item.initialSeconds)}</td>
                <td>{secondsToHms(item.newSeconds)}</td>
                {canDeleteTimeEntry && !props.isRecordBelongsToJaeAndUneditable && (
                  <td>
                    <Button variant="danger" onClick={() => deleteEdit(item._id)} style={{...(tabletView ? {fontSize: "10px"} : {}), ...(darkMode ? boxStyleDark : boxStyle)}}>
                      Delete&nbsp;Edit
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default connect(null, { hasPermission })(TimeEntryEditHistory);

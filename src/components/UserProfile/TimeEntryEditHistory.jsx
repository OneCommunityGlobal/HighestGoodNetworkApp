import moment from 'moment';
import React from 'react';
import { Table, Button } from 'react-bootstrap';
import hasPermission from '../../utils/permissions';
import { connect } from 'react-redux';

/**
 * Shows the dates and times a user has edited their time entries. Admins are given the ability to delete these edits.
 * @param {*} props.userProfile
 * @param {function} props.setUserProfile
 * @returns
 */
const TimeEntryEditHistory = props => {
  const editHistory = [...props.userProfile.timeEntryEditHistory].reverse();

  const canDeleteTimeEntry = props.hasPermission('deleteTimeEntry') ;
 
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
      <p>Time Entry Edit History</p>
      <Table variant="">
        <thead>
          <tr>
            <th>
              Date / Time
              <br />
              (Pacific Time)
            </th>
            <th>
              Initial Time
              <br />
              (HH:MM:SS)
            </th>
            <th>
              New Time
              <br />
              (HH:MM:SS)
            </th>
            {canDeleteTimeEntry && <th></th>}
          </tr>
        </thead>
        <tbody>
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
                    <Button variant="danger" onClick={() => deleteEdit(item._id)}>
                      Delete&nbsp;Edit
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};

export default connect(null, { hasPermission })(TimeEntryEditHistory);

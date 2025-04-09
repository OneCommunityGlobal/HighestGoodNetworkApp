import { useState, useEffect } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useDispatch, connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import './Timelog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import hasPermission from 'utils/permissions';
import { hrsFilterBtnColorMap } from 'constants/colors';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { toast } from 'react-toastify';
import TimeEntryForm from './TimeEntryForm';
import DeleteModal from './DeleteModal';

import { editTimeEntry, getTimeEntriesForWeek } from '../../actions/timeEntries';
import { editTeamMemberTimeEntry } from '../../actions/task';

/**
 * This component can be imported in TimeLog component's week tabs and Tasks tab
 *  1. In TimeLog - current week time log, last week, week before ... tabs:
 *    time entry data are from state.timeEntries;
 *    time entry user profile is from state.userProfile
 *
 *  2. In TimeLog - Tasks tab:
 *    time entry data and user profile are both from state.teamMemberTasks.usersWithTimeEntries
 *
 *  check string value of from to decide which state to change upon time entry edit
 */

function TimeEntry(props) {
  // props from parent
  const { from, data, displayYear, timeEntryUserProfile, tab } = props;
  // props from store
  const { authUser } = props;

  const { _id: timeEntryUserId } = timeEntryUserProfile;
  const { _id: timeEntryId } = data;
  const { dateOfWork, isTangible, hours, minutes, projectName, taskName, taskId, notes } = data;

  const [timeEntryFormModal, setTimeEntryFormModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredColor, setFilteredColor] = useState(hrsFilterBtnColorMap[7]);
  const dispatch = useDispatch();

  const hasATimeEntryEditPermission =
    props.hasPermission('editTimeEntryTime') ||
    props.hasPermission('editTimeEntryDescription') ||
    props.hasPermission('editTimeEntryDate');

  const cantEditJaeRelatedRecord = cantUpdateDevAdminDetails(
    timeEntryUserProfile?.email ? timeEntryUserProfile.email : '',
    authUser.email,
  );

  const toggle = () => setTimeEntryFormModal(modal => !modal);

  const isAuthUser = timeEntryUserId === authUser.userid;
  const isSameDay =
    moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD') === dateOfWork;

  // default permission: auth use can edit own sameday timelog entry, but not tangibility
  const isAuthUserAndSameDayEntry = isAuthUser && isSameDay;

  // permission to edit any time log entry (from other user's Dashboard
  // For Administrator/Owner role, hasPermission('editTimelogInfo') should be true by default
  const canEditTangibility =
    (isAuthUser
      ? dispatch(hasPermission('toggleTangibleTime'))
      : dispatch(hasPermission('editTimeEntryToggleTangible'))) && !cantEditJaeRelatedRecord;

  // permission to Delete any time entry from other user's Dashboard
  const canDeleteOther = dispatch(hasPermission('deleteTimeEntryOthers'));

  // permission to delete any time entry on their own time logs tab
  const canDeleteOwn = dispatch(hasPermission('deleteTimeEntryOwn'));

  // condition for allowing delete in delete model
  // default permission: delete own sameday tangible entry = isAuthUserAndSameDayEntry
  const canDelete = canDeleteOther || canDeleteOwn;

  const toggleTangibility = async () => {
    setIsProcessing(true);
    const newData = {
      ...data,
      isTangible: !isTangible,
    };
    try {
      if (from === 'TaskTab') {
        await dispatch(editTeamMemberTimeEntry(newData));
      } else if (from === 'WeeklyTab') {
        await dispatch(editTimeEntry(timeEntryId, newData));
        await dispatch(getTimeEntriesForWeek(timeEntryUserId, tab));
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const editFilteredColor = () => {
    try {
      const daysPast = moment().diff(dateOfWork, 'days');
      const choosenColor = hrsFilterBtnColorMap[daysPast + 1] || hrsFilterBtnColorMap[7];
      setFilteredColor(choosenColor);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in editFilteredColor:', error);
    }
  };

  useEffect(() => {
    editFilteredColor();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          width: '12px',
          marginBottom: '4px',
          border: `5px solid ${filteredColor}`,
          backgroundColor: taskId ? filteredColor : 'white',
        }}
      />
      <Card
        className="mb-1 p-2"
        style={{
          backgroundColor: isTangible ? '#CCFFCC' : '#CCFFFF',
          flexGrow: 1,
          maxWidth: 'calc(100% - 12px)',
        }}
      >
        <Row className="mx-0">
          <Col md={3} className="date-block px-0">
            <div className="date-div">
              <div>
                <h4>{moment(dateOfWork).format('MMM D')}</h4>
                {displayYear && <h5>{moment(dateOfWork).format('YYYY')}</h5>}
                <h5 className="text-info">{moment(dateOfWork).format('dddd')}</h5>
              </div>
            </div>
          </Col>
          <Col md={4} className="px-0">
            <h4 className="text-success">
              {hours}h {minutes}m
            </h4>
            <div className="text-muted">Project/Task:</div>
            <p>
              {projectName}
              <br />
              {taskName && `\u2003 ↳ ${taskName}`}
            </p>
            <div className="mb-3">
              {canEditTangibility ? (
                <>
                  <span className="text-muted">Tangible:&nbsp;</span>
                  <input
                    type="checkbox"
                    name="isTangible"
                    checked={isTangible}
                    disabled={isProcessing}
                    onChange={toggleTangibility}
                  />
                  {isProcessing ? <span> Processing... </span> : null}
                </>
              ) : (
                <span className="font-italic">{isTangible ? 'Tangible' : 'Intangible'}</span>
              )}
            </div>
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="time-entry-container">
              <div className="notes-section">
                <div className="text-muted">Notes:</div>
                {ReactHtmlParser(notes)}
              </div>
              <div className="d-flex justify-content-end">
                {(hasATimeEntryEditPermission || isAuthUserAndSameDayEntry) &&
                  !cantEditJaeRelatedRecord && (
                    <button type="button" aria-label="FAEdit" className="mr-3 text-primary">
                      <FontAwesomeIcon icon={faEdit} size="lg" onClick={toggle} />
                    </button>
                  )}
                {canDelete && (
                  <button type="button" aria-label="DeleteModal" className="text-primary">
                    <DeleteModal timeEntry={data} />
                  </button>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
      {/* this TimeEntryForm could be rendered from either weekly tab or task tab */}
      <TimeEntryForm
        from={from}
        edit
        data={data}
        toggle={toggle}
        isOpen={timeEntryFormModal}
        tab={tab}
      />
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeEntry);

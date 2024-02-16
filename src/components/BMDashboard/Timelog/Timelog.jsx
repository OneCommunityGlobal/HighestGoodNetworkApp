import './Timelog.css';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getUserProfile } from '../../../actions/userProfile';

function Timelog() {
  const projects = useSelector(state => state.bmProjects);
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  function formatHours(hours) {
    const totalSeconds = Math.round(hours * 3600);
    const formattedHours = Math.floor(totalSeconds / 3600);
    const formattedMinutes = Math.floor((totalSeconds % 3600) / 60);
    const formattedSeconds = totalSeconds % 60;

    const paddedHours = String(formattedHours).padStart(2, '0');
    const paddedMinutes = String(formattedMinutes).padStart(2, '0');
    const paddedSeconds = String(formattedSeconds).padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }

  function getCurrentDate() {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate
      .getFullYear()
      .toString()
      .slice(-2);

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    return `${formattedDay}/${formattedMonth}/${year}`;
  }

  async function fetchUserProfile(userID) {
    const userProfile = await dispatch(getUserProfile(userID));
    const { firstName, lastName, role, totalTangibleHrs, _id } = userProfile;
    const timerStatus = false;

    const userProfileData = {
      firstName,
      lastName,
      role,
      totalTangibleHrs,
      timerStatus,
      _id,
    };

    return userProfileData;
  }

  async function handleProjectChange(event) {
    setLoading(true);
    const project = projects.find(curr => curr._id === event.target.value);
    setMembersData([]);

    if (!project) {
      setMembersData([]);
      setLoading(false);
      return;
    }

    try {
      const members = await Promise.all(
        project.members.map(member => fetchUserProfile(member.user)),
      );
      setMembersData(members);
    } catch (error) {
      setMembersData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleTimerChange(userID, status) {
    const updatedUsersData = membersData.map(user => {
      if (user._id === userID) {
        return { ...user, timerStatus: status === 'START' };
      }

      return user;
    });

    setMembersData(updatedUsersData);
  }

  return (
    <div className="BMTimelogContainer">
      <div className="BMTimelogWrapper">
        <div className="BMTimelogHeader">Member Group Check In</div>
        <div className="BMTimelogRow1">
          <div className="BMTimelogDate">Date: {getCurrentDate()}</div>
          <div className="BMTimelogProjectSelection">
            <div>Project:</div>
            <select className="BMProjectSelect" onChange={handleProjectChange}>
              <option value="">Select a Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="BMTimelogBody">
          {loading && <div className="LoadingContainer">Loading</div>}
          {membersData &&
            membersData.map(member => (
              <div key={member._id} className={`MemberTimelogContainer ${member.role}Container`}>
                <div
                  className={`MemberTimelogName ${member.role}Name`}
                >{`${member.firstName} ${member.lastName}`}</div>
                <div className="MemberTimelogTime">{formatHours(member.totalTangibleHrs)}</div>
                <div className="MemberTimelogButtonRow">
                  {!member.timerStatus ? (
                    <div
                      className="MemberTimelogBtn bmTLStart"
                      onClick={() => handleTimerChange(member._id, 'START')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleTimerChange(member._id, 'START');
                        }
                      }}
                    >
                      START
                    </div>
                  ) : (
                    <div
                      className="MemberTimelogBtn bmTLPause"
                      onClick={() => handleTimerChange(member._id, 'PAUSE')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleTimerChange(member._id, 'PAUSE');
                        }
                      }}
                    >
                      PAUSE
                    </div>
                  )}
                  <div className="MemberTimelogBtn bmTLStop">STOP</div>
                </div>
                <div className="MemberTimelogStartTime">
                  <div>Start at:</div>
                  <div className="MemberTimelogStartTimeValue">HH:MM:SS</div>
                </div>
                <div className="MemberTimelogTaskContainer">
                  <div>Task:</div>
                  <select className="BMTaskSelect" onChange={handleProjectChange}>
                    <option value="">Select a Task</option>
                  </select>
                </div>
                <div className="MemberTimelogBtn bmTLClear">CLEAR</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Timelog;

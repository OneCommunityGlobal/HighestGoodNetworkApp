import './Timelog.css';
import { useSelector } from 'react-redux';

function Timelog() {
  const projects = useSelector(state => state.bmProjects);

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

  return (
    <div className="BMTimelogContainer">
      <div className="BMTimelogWrapper">
        <div className="BMTimelogHeader">Member Group Check In</div>
        <div className="BMTimelogRow1">
          <div className="BMTimelogDate">Date: {getCurrentDate()}</div>
          <div className="BMTimelogProjectSelection">
            <div>Project:</div>
            <select className="BMProjectSelect">
              <option value="">Select a Project</option>;
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="BMTimelogBody">
          <div className="MemberTimelogContainer">
            <div className="MemberTimelogName">Name</div>
            <div className="MemberTimelogTime">HH:MM:SS</div>
            <div className="MemberTimelogButtonRow">
              <div className="MemberTimelogBtn bmTLStart">START</div>
              <div className="MemberTimelogBtn bmTLStop">STOP</div>
            </div>
            <div className="MemberTimelogStartTime">
              <div>Start at:</div> <div className="MemberTimelogStartTimeValue">HH:MM:SS</div>
            </div>
            <div className="MemberTimelogTaskContainer">
              <div>Task:</div>
              <select className="BMTaskSelect">
                <option value="">Select a Task</option>;
              </select>
            </div>
            <div className="MemberTimelogBtn bmTLClear">CLEAR</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timelog;

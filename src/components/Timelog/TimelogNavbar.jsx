import React from 'react'
import { Progress } from 'reactstrap';
import { useSelector } from 'react-redux'

const TimelogNavbar = ({userId}) => {
    const { firstName, lastName } = useSelector(state => state.userProfile);

    const timeEntries = useSelector(state => state.timeEntries.weeks[0]);
    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60
    const totalEffort = timeEntries.reduce(reducer, 0);
    const weeklyComittedHours = useSelector(state => state.userProfile.weeklyComittedHours)
    const progressPercentage = totalEffort / weeklyComittedHours * 100

    const getBarColor = hours => {
      if (hours < 5){
        return "red";
      }
      else if (hours < 10){
        return "orange";
      }
      else if (hours < 20){
        return "green";
      }
      else if (hours < 30){
        return "blue"
      }
      else if (hours < 40){
        return "indigo"
      }
      else if (hours < 50){
        return "violet"
      }
      else {
        return "purple"
      }
    }

    const getBarValue = hours => {
      if (hours <= 40){
        return hours * 2;
      }
      else if (hours <= 50) {
        return (hours - 40) * 1.5 + 80;
      }
      else {
        return (hours - 50) * 5 / 40 + 95;
      }
    }

    return (
        <div>
        <nav className="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
          <li className="navbar-brand">{firstName} {lastName}'s Timelog</li>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#timelogsnapshot" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
          </button>
          <div className="collapse navbar-collapse" id="timelogsnapshot">
            <ul className="navbar-nav w-100">
              <li className="nav-item navbar-text mr-3 w-25" id="timelogweeklychart">
                <div>Current Week : {totalEffort.toFixed(2)} / {weeklyComittedHours}</div>
                {/* <Progress striped value={progressPercentage} color={
                  progressPercentage < 30 ? 
                  "danger" : 
                  progressPercentage < 90 ? 
                  "warning" : "success"} 
                /> */}
                <Progress value={getBarValue(totalEffort)} className={getBarColor(totalEffort)} 
                  striped={totalEffort < weeklyComittedHours} 
                />
              </li>
              <li className="nav-item  navbar-text">
                <span className="fa fa-tasks icon-large" data-toggle="modal" data-target="#actionItems">
                  <icon className="badge badge-pill badge-warning badge-notify"></icon>
                </span>
              </li>
              <li className="nav-item navbar-text">
                <i className="fa fa-envelope icon-large" data-toggle="modal" data-target="#notifications">
                  <icon className="badge badge-pill badge-warning badge-notify">noti</icon>
                </i>
              </li>
              <li className="nav-item navbar-text">
                <a className="nav-link" href= {`/userprofile/${userId}`} >View Profile</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
}

export default TimelogNavbar
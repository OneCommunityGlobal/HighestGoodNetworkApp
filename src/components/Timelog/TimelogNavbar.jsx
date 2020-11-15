import React from 'react'
import { Progress } from 'reactstrap'
import { useSelector } from 'react-redux'

const TimelogNavbar = ({ userId }) => {
  const { firstName, lastName } = useSelector(state => state.userProfile)

  const timeEntries = useSelector(state => state.timeEntries.weeks[0])
  const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60
  const totalEffort = timeEntries.reduce(reducer, 0)
  const weeklyComittedHours = useSelector(state => state.userProfile.weeklyComittedHours)
  const progressPercentage = (totalEffort / weeklyComittedHours) * 100

  const getBarColor = hours => {
    if (hours < 5) {
      return 'red'
    }
    if (hours < 10) {
      return 'orange'
    }
    if (hours < 20) {
      return 'green'
    }
    if (hours < 30) {
      return 'blue'
    }
    if (hours < 40) {
      return 'indigo'
    }
    if (hours < 50) {
      return 'violet'
    }
    return 'purple'
  }

  const getBarValue = hours => {
    if (hours <= 40) {
      return hours * 2
    }
    if (hours <= 50) {
      return (hours - 40) * 1.5 + 80
    }
    return ((hours - 50) * 5) / 40 + 95
  }

  return (
    <div>
      <nav className="navbar navbar-expand-sm navbar-light navbar-border bg-light mb-2 col-md-12 nav-fill ">
        <li className="navbar-brand pb-3">
          {firstName} {lastName}
          's Timelog
        </li>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#timelogsnapshot"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        />
        <div className="collapse navbar-collapse  ml-auto flex-column" id="timelogsnapshot">
          <ul className="navbar-nav w-75">
            <li className="nav-item navbar-text" id="timelogweeklychart">
              <div>
                Current Week : {totalEffort.toFixed(2)} / {weeklyComittedHours}
              </div>
              {/* <Progress striped value={progressPercentage} color={
                  progressPercentage < 30 ?
                  "danger" :
                  progressPercentage < 90 ?
                  "warning" : "success"}
                /> */}
              <Progress
                value={getBarValue(totalEffort)}
                className={getBarColor(totalEffort)}
                striped={totalEffort < weeklyComittedHours}
              />
            </li>
            </ul>
            <ul className="navbar-nav flex-row ml-auto">
            <li className="nav-item navbar-text ml-4">
              <span
                className="fa fa-tasks icon-large align-middle"
                data-toggle="modal"
                data-target="#actionItems"
              >
                <i className="badge badge-pill badge-warning badge-notify align-middle" />
              </span>
            </li>
            <li className="nav-item navbar-text ml-4">
              <i
                className="fa fa-envelope icon-large align-middle"
                data-toggle="modal"
                data-target="#notifications"
              >
                <i className="badge badge-pill badge-warning badge-notify align-middle ml-1">noti</i>
              </i>
            </li>
            <li className="nav-item navbar-text ml-4">
              <a className="nav-link" href={`/userprofile/${userId}`}>
                View Profile
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default TimelogNavbar

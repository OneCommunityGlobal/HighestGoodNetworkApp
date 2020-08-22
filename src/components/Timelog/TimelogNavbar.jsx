import React from 'react'
import { useSelector } from 'react-redux'

const TimelogNavbar = ({ userId }) => {
  const { firstName, lastName } = useSelector(state => state.userProfile)

  return (
    <div>
      <nav className="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
        <li className="navbar-brand">
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
        <div className="collapse navbar-collapse" id="timelogsnapshot">
          <ul className="navbar-nav w-100">
            <li className="nav-item navbar-text mr-3 w-25" id="timelogweeklychart">
              progress bar
            </li>
            <li className="nav-item  navbar-text">
              <span
                className="fa fa-tasks icon-large"
                data-toggle="modal"
                data-target="#actionItems"
              >
                <icon className="badge badge-pill badge-warning badge-notify" />
              </span>
            </li>
            <li className="nav-item navbar-text">
              <i
                className="fa fa-envelope icon-large"
                data-toggle="modal"
                data-target="#notifications"
              >
                <icon className="badge badge-pill badge-warning badge-notify">noti</icon>
              </i>
            </li>
            <li className="nav-item navbar-text">
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

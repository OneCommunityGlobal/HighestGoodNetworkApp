import React, { useState } from 'react'

import {
  Row,
  Col,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from 'reactstrap'
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link'
import './board.css'
import task_icon from './task_icon.png'
import badges_icon from './badges_icon.png'
import bluesquare_icon from './bluesquare_icon.png'
import report_icon from './report_icon.png'

const DashboardSummaryBar = () => {
  const { firstName, lastName, _id } = useSelector(state => state.userProfile)

  const timeEntries = useSelector(state => state.timeEntries.weeks[0])
  const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60
  const totalEffort = timeEntries.reduce(reducer, 0)
  const weeklyComittedHours = useSelector(state => state.userProfile.weeklyComittedHours)

  const initialInfo = {
    in: false,
    information: '',
  }

  const [inform, setInfo] = useState(initialInfo)

  const openReport = () => {
    const str = `A number notification that shows how many new task notifications there are.
    Jerry is working on the tasks component so you just need to place the notification and have it function to increase the notifications number with each time an additional task is edited. Jerry will connect this later to his work.
    Clicking the “Tasks” icon should take the person to the Tasks section on the person's dashboard. `

    const newstr = str.split('\n').map((item, i) => <p key={i}>{item}</p>)
    setInfo(info => ({
      ...info,
      in: !info.in,
      information: newstr,
    }))
  }

  // async componentDidMount() {
  //   await this.props.getWeeklySummaries(this.props.currentUser.userid);
  //   const { weeklySummariesCount } = this.props.summaries;}

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

  const onTaskClick = () => {
    window.location.hash = '#tasks'
  }

  const onBadgeClick = () => {
    window.location.hash = '#badgesearned'
  }

  return (
    <Row className="my-2 bg--bar text-light">
        <div className="col-md-2 text-list" align="center">
          <font className="text--silver" size="3">
            {' '}
            Activity for{' '}
          </font>
          <CardTitle className="text--silver" tag="h3">
            {firstName} {lastName}
          </CardTitle>
        </div>

        <div className="col-md-3">
          <Row>
            {totalEffort < weeklyComittedHours && (
              <div className="border-red col-sm-4 bg--white-smoke" align="center">
                <div className="py-1"> </div>
                <h1 className="text--silver" align="center">
                  !
                </h1>
                <font className="text--silver" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}
            {totalEffort >= weeklyComittedHours && (
              <div className="border-green col-sm-4 bg--dark-green" align="center">
                <div className="py-1"> </div>
                <h1 align="center">✓</h1>
                <font size="3">HOURS</font>
                <div className="py-2"> </div>
              </div>
            )}

            <div className="col-sm-8 bg--white-smoke text-list" align="center">
              <li className="nav-item navbar-text" id="timelogweeklychart">
                <div className="text--silver">
                  Current Week : {totalEffort.toFixed(2)} / {weeklyComittedHours}
                </div>

                <Progress
                  value={getBarValue(totalEffort)}
                  className={getBarColor(totalEffort)}
                  striped={totalEffort < weeklyComittedHours}
                />
              </li>
            </div>
          </Row>
        </div>

        <div className="col-md-3">
          <Row>
            <div className="border-red col-sm-4 bg--white-smoke" align="center">
              <div className="py-1"> </div>
              <h1 className="text--silver" align="center">
                !
              </h1>
              <font className="text--silver" size="3">
                SUMMARY
              </font>
              <div className="py-2"> </div>
            </div>
            {/* <div className="border-green col-sm-4 bg--dark-green" align="center">
              <div className="py-1"> </div>
              <h1 align="center">✓</h1>
              <font size="3">SUMMARY</font>
              <div className="py-2"> </div>
            </div> */}

            <div className="col-sm-8 bg--white-smoke" align="center">
              <div className="py-3"> </div>
              <font className="text--silver" align="center" size="3">
                You still need to complete the weekly summary.
              </font>
              <div className="py-1"> </div>
            </div>
          </Row>
        </div>
        {/* {isSubmitted && (<font className="text--silver" align="center" size="3">
            You have completed weekly summary.
          </font>)}
          {!isSubmitted && (<font className="text--silver" align="center" size="3">
            You still need to complete the weekly summary.
          </font>)} */}

        <Col className="col-md-4 badge-list" align="center">
          <div className="frame">
            <div className="redBackgroup">
              <span>99</span>
            </div>

            <img
              className="image_frame"
              src={task_icon}
              alt=""
              width="85px"
              height="85px"
              onClick={onTaskClick}
            />
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame">
            <img
              className="image_frame"
              src={badges_icon}
              alt=""
              width="85px"
              height="85px"
              onClick={onBadgeClick}
            />
            <div className="redBackgroup">
              <span>9</span>
            </div>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame">
            <Link to={`/userprofile/${_id}#bluesquare`}>
              <img
                className="image_frame"
                src={bluesquare_icon}
                alt=""
                width="85px"
                height="85px"
              />
              <div className="redBackgroup">
                <span>19</span>
              </div>
            </Link>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame">
            <img
              className="image_frame"
              src={report_icon}
              alt=""
              width="85px"
              height="85px"
              onClick={openReport}
            />
            {/* <div className="blackBackgroup">
              <i className="fa fa-exclamation" aria-hidden="true" />
            </div> */}
          </div>
        </Col>
        <Modal isOpen={inform.in} toggle={openReport}>
          <ModalHeader>Bug Report</ModalHeader>
          <ModalBody />
          <ModalFooter>
            <Button onClick={openReport} color="primary">
              Submit
            </Button>
            <Button onClick={openReport} color="danger">
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Row>
  )
}

export default DashboardSummaryBar

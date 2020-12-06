import React, { useState } from 'react'

import {
  Alert,
  Card,
  Row,
  Col,
  Container,
  CardTitle,
  CardSubtitle,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
} from 'reactstrap'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { HashLink as Link } from 'react-router-hash-link'
import MonthlyEffort from '../MonthlyEffort'
// import TimelogNavbar from '../TimelogNavbar'
import Leaderboard from '../LeaderBoard'
import WeeklySummaryModal from '../WeeklySummary/WeeklySummaryModal'
import '../../App.css'
import './board.css'
import task_icon from './task_icon.png'
import badges_icon from './badges_icon.png'
import bluesquare_icon from './bluesquare_icon.png'
import report_icon from './report_icon.png'
import { getUserProfile } from '../../actions/userProfile'

const Dashboard = () => {
  const { firstName, lastName } = useSelector(state => state.userProfile)

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
    window.location.hash = '#task'
  }

  const onBadgeClick = () => {
    window.location.hash = '#badgeearned'
  }

  return (
    <Container fluid>
      <Row>
        <Col sm={{ size: 12 }}>
          <Alert color="info">
            <b>Reminder</b>: Make sure to purge the cache or "hard" refresh the page in your browser
            if you don's see the changes you had merged with the "development" branch. This message
            will be removed before the site goes "live".
          </Alert>
        </Col>
      </Row>
      <Row className="my-2 bg--dark-sea-green text-light">
        <div className="col-md-2" align="center">
          <div className="py-2"> </div>
          <font size="3"> Activity for </font>
          <CardTitle tag="h3">
            {firstName} {lastName}
          </CardTitle>
        </div>

        <div className="border col-md-1 bg--white-smoke" align="center">
          <div className="py-1"> </div>
          {/* <i className="fa fa-exclamation fa-3x" aria-hidden="true" />  */}
          <h1 className="text--silver" align="center">
            !
          </h1>
          <font className="text--silver" size="3">
            HOURS
          </font>
          {/* <div className="py-1"> </div> */}
        </div>

        <div className="col-md-2 bg--white-smoke" align="center">
          <div className="py-2"> </div>
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

        <div className="col-md-1 bg--dark-green" align="center">
          <div className="py-1"> </div>
          <h1 align="center">✓</h1>
          <font size="3">SUMMARY</font>
          {/* <div className="py-2"> </div> */}
        </div>

        <div className="col-md-2 bg--white-smoke" align="center">
          <div className="py-2"> </div>
          <font className="text--silver" align="center" size="3">
            You still need to complete the weekly summary.
          </font>
          {/* {isSubmitted && (<font className="text--silver" align="center" size="3">
            You have completed weekly summary.
          </font>)}
          {!isSubmitted && (<font className="text--silver" align="center" size="3">
            You still need to complete the weekly summary.
          </font>)} */}
        </div>

        <Col className="col-md-4" align="center">
          {/* <div className="py-1"> </div> */}
          <img src={task_icon} alt="" width="85px" height="85px" onClick={onTaskClick} />
          <div className="redBackgroup">
            <span>99</span>
          </div>
          &nbsp;&nbsp;
          <img src={badges_icon} alt="" width="85px" height="85px" onClick={onBadgeClick} />
          <div className="redBackgroup">
            <span>9</span>
          </div>
          &nbsp;&nbsp;
          <Link to="/userprofile/5f421a54552a840017149d32#bluesquare">
            <img src={bluesquare_icon} alt="" width="85px" height="85px" />
            <div className="redBackgroup">
              <span>19</span>
            </div>
          </Link>
          &nbsp;&nbsp;
          <img src={report_icon} alt="" width="85px" height="85px" onClick={openReport} />
          <div className="blackBackgroup">
            <i className="fa fa-exclamation" aria-hidden="true" />
          </div>
          {/* <div className="py-1"> </div> */}
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
      <Row>
        <Col lg={{ size: 7 }}>&nbsp;</Col>
        <Col lg={{ size: 5 }}>
          <WeeklySummaryModal />
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          <Row className="p-5 my-2 bg--cadet-blue text-light">
            <div className="py-5 my-5"> </div>
            <h3>Timelog goes here...</h3>
            <div className="py-5 my-5"> </div>
          </Row>
          <Row className="p-5 my-2 bg--cadet-blue text-light" id="task">
            <div className="py-5 my-5"> </div>
            <a name="tasksLink">
              <h3>Tasks go here...</h3>
            </a>
            <div className="py-5 my-5"> </div>
          </Row>
          <Row className="p-5 my-2 bg--cadet-blue text-light" id="badgeearned">
            <div className="py-5 my-5"> </div>
            <h3>Badges go here...</h3>
            <div className="py-5 my-5"> </div>
          </Row>
          <Row className="p-5 my-2 bg--cadet-blue text-light">
            <div className="py-5 my-5"> </div>
            <h3>...</h3>
            <div className="py-5 my-5"> </div>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard
// extends Component {
//     async componentDidMount() {
//       await this.props.getWeeklySummaries(this.props.currentUser.userid)
//       const { weeklySummaries } = this.props.summaries

//       const summary = (weeklySummaries && weeklySummaries[0] && weeklySummaries[0].summary) || ''
//     }
//   }

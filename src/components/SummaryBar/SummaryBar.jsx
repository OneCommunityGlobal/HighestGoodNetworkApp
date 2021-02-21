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
  Progress, Form, FormGroup, Label, Input, FormText 
} from 'reactstrap'
import { useSelector } from 'react-redux'
import { HashLink as Link } from 'react-router-hash-link'
import './SummaryBar.css'
import task_icon from './task_icon.png'
import badges_icon from './badges_icon.png'
import bluesquare_icon from './bluesquare_icon.png'
import report_icon from './report_icon.png'

const SummaryBar = () => {
  const { firstName, lastName, _id } = useSelector(state => state.userProfile)

  const timeEntries = useSelector(state => state.timeEntries.weeks[0])
  const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60
  const totalEffort = timeEntries.reduce(reducer, 0)
  const weeklyComittedHours = useSelector(state => state.userProfile.weeklyComittedHours)

  const initialInfo = {
    in: false,
    information: '',
  }

  const [report, setBugReport] = useState(initialInfo)

  const openReport = () => {

    const htmlStr = '';  //str.split('\n').map((item, i) => <p key={i}>{item}</p>)
    setBugReport(info => ({
      ...info,
      in: !info.in,
      information: htmlStr,
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
    <Row className="my-2 bg--bar text-light no-gutters">
        <div className="col-md-2 text-list" align="center">
          <font className="text--black  align-middle" size="3">
            {' '}
            Activity for{' '}
          </font>
          <CardTitle className="text--black align-middle" tag="h3">
            {firstName} {lastName}
          </CardTitle>
        </div>

        <div className="col-md-3 no-gutters">
          <Row className='no-gutters'>
            {totalEffort < weeklyComittedHours && (
              <div className="border-red col-sm-4 bg--white-smoke no-gutters" align="center">
                <div className="py-1"> </div>
                <p className="large_text_summary" align="center">
                  !
                </p>
                <font className="text--black" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}
            {totalEffort >= weeklyComittedHours && (
              <div className="border-green col-sm-4 bg--dark-green no-gutters" align="center">
                <div className="py-1"> </div>
                <p className="large_text_summary" align="center">✓</p>
                <font size="3">HOURS</font>
                <div className="py-2"> </div>
              </div>
            )}

            <div className="col-sm-8 bg--white-smoke text-list no-gutters" align="center">
              <li className="nav-item navbar-text" id="timelogweeklychart">
                <div className="text--black">
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

        <div className="col-md-3 no-gutters">
          <Row className='no-gutters'>
            <div className="border-red col-sm-4 bg--white-smoke no-gutters" align="center">
              <div className="py-1"> </div>
              <h1 className="text--black" align="center">
                !
              </h1>
              <font className="text--black" size="3">
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
              <font className="text--black" align="center" size="3">
                You still need to complete the weekly summary.
              </font>
              <div className="py-1"> </div>
            </div>
          </Row>
        </div>
        {/* {isSubmitted && (<font className="text--black" align="center" size="3">
            You have completed weekly summary.
          </font>)}
          {!isSubmitted && (<font className="text--black" align="center" size="3">
            You still need to complete the weekly summary.
          </font>)} */}

        <Col className="col-md-4 badge-list" align="center">
        <div className="row no-gutters">
        &nbsp;&nbsp;&nbsp;
          <div className="frame col">
            <div className="redBackgroup">
              <span>99</span>
            </div>

            <img
              className="image_frame"
              src={task_icon}
              alt=""
              onClick={onTaskClick}
            />
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame col">
            <img
              className="image_frame"
              src={badges_icon}
              alt=""
              onClick={onBadgeClick}
            />
            <div className="redBackgroup">
              <span>9</span>
            </div>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame col">
            <Link to={`/userprofile/${_id}#bluesquare`}>
              <img
                className="image_frame"
                src={bluesquare_icon}
                alt=""
              />
              <div className="redBackgroup">
                <span>19</span>
              </div>
            </Link>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div className="frame col">
            <img
              className="image_frame"
              src={report_icon}
              alt=""
              onClick={openReport}
            />
            {/* <div className="blackBackgroup">
              <i className="fa fa-exclamation" aria-hidden="true" />
            </div> */}
          </div>
          </div>
        </Col>
        <Modal isOpen={report.in} toggle={openReport}>
          <ModalHeader>Bug Report</ModalHeader>
          <ModalBody> 
            <Form>
            <FormGroup>
              <Label for ='title'>[Feature Name] Bug Title </Label>
              <Input type="textbox" name="title" id="title" placeholder="Provide Concise Sumarry Title..." />
            </FormGroup>
            <FormGroup>
            <Label for ='environment'> Environment (OS/Device/App Version/Connection/Time etc) </Label>
              <Input type="textarea" name="environment" id="environment" placeholder="Environment Info..." />
            </FormGroup>
            <FormGroup>
            <Label for ='reproduction'>Steps to reproduce (Please Number, Short Sweet to the point) </Label>
              <Input type="textarea" name="reproduction" id="reproduction" placeholder="1. Click on the UserProfile Button in the Header.." />
            </FormGroup>
            <FormGroup>
            <Label for ='expected'>Expected Result (Short Sweet to the point) </Label>
              <Input type="textarea" name="expected" id="expected" placeholder="Whad did you expect to happen?..." />
            </FormGroup>
            <FormGroup>
            <Label for ='actual'>Actual Result (Short Sweet to the point) </Label>
              <Input type="textarea" name="actual" id="actual" placeholder="What actually happened?.." />
            </FormGroup>
            <FormGroup>
            <Label for ='visual'>Visual Proof (screenshots, videos, text) </Label>
              <Input type="textarea" name="environment" id="environment" placeholder="Links to screenshots etc..." />
            </FormGroup>
            <FormGroup>
            <Label for ='severity'>Severity/Priority (How Bad is the Bug?  </Label>
              <Input type ="select" name='severity' id='severity'>
                <option>1. High/Critical </option>
                <option>2. Medium </option>
                <option>3. Minor</option>
              </Input>
            </FormGroup>

    
    
    
    
            </Form>
          </ModalBody>
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

export default SummaryBar

import React, { useState, useEffect } from 'react';

import {
  Container,
  Row,
  Col,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { HashLink as Link } from 'react-router-hash-link';
import './SummaryBar.css';
import task_icon from './task_icon.png';
import badges_icon from './badges_icon.png';
import bluesquare_icon from './bluesquare_icon.png';
import report_icon from './report_icon.png';
import httpService from '../../services/httpService';
import { faWindowMinimize } from '@fortawesome/free-regular-svg-icons';

import { ApiEndpoint } from 'utils/URL';

const SummaryBar = (props) => {
  const { asUser, isAdmin } = props;
  const { firstName, lastName, email, _id } = useSelector((state) => state.userProfile);
  const authenticateUser = useSelector((state) => state.auth.user);
  const authenticateUserId = authenticateUser ? authenticateUser.userid : '';
  const matchUser = asUser == authenticateUserId ? true : false;

  const timeEntries = useSelector((state) => {
    let timeEntries = state?.timeEntries?.weeks;
    if (timeEntries) {
      return timeEntries[0];
    } else {
      return [];
    }
  });

  const calculateTotalTime = (data, isTangible) => {
    const filteredData = data.filter((entry) => entry.isTangible === isTangible);

    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };

  const weeklyComittedHours = useSelector((state) => state.userProfile.weeklyComittedHours);
  const weeklySummary = useSelector((state) => {
    let summaries = state.userProfile?.weeklySummaries;
    if (summaries && Array.isArray(summaries) && summaries[0] && summaries[0].summary) {
      return summaries[0].summary;
    } else {
      return '';
    }
  });

  const infringements = useSelector((state) => {
    if (state.userProfile && state.userProfile.infringments) {
      return state.userProfile.infringments.length;
    } else {
      return 0;
    }
  });

  const badges = useSelector((state) => {
    if (state.userProfile && state.userProfile.badgeCollection) {
      return state.userProfile.badgeCollection.length;
    } else {
      return 0;
    }
  });

  let tasks = useSelector((state) => {
    if (state.tasks && state.tasks.taskItems) {
      return state.tasks.taskItems.length;
    } else {
      return 0;
    }
  });

  const initialInfo = {
    in: false,
    information: '',
  };

  const [report, setBugReport] = useState(initialInfo);

  const openReport = () => {
    const htmlStr = ''; //str.split('\n').map((item, i) => <p key={i}>{item}</p>)
    setBugReport((info) => ({
      ...info,
      in: !info.in,
      information: htmlStr,
    }));
  };

  const sendBugReport = (event) => {
    event.preventDefault();
    let bugReportForm = document.getElementById('bugReportForm');
    let formData = new FormData(bugReportForm);
    var data = {};
    formData.forEach(function (value, key) {
      data[key] = value;
    });
    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['email'] = email;

    httpService.post(`${ApiEndpoint}/dashboard/bugreport/${_id}`, data).catch((e) => {});
    openReport();
  };

  // async componentDidMount() {
  //   await this.props.getWeeklySummaries(this.props.currentUser.userid);
  //   const { weeklySummariesCount } = this.props.summaries;}

  const getBarColor = (hours) => {
    if (hours < 5) {
      return 'red';
    }
    if (hours < 10) {
      return 'orange';
    }
    if (hours < 20) {
      return 'green';
    }
    if (hours < 30) {
      return 'blue';
    }
    if (hours < 40) {
      return 'indigo';
    }
    if (hours < 50) {
      return 'violet';
    }
    return 'purple';
  };

  const getBarValue = (hours) => {
    if (hours <= 40) {
      return hours * 2;
    }
    if (hours <= 50) {
      return (hours - 40) * 1.5 + 80;
    }
    return ((hours - 50) * 5) / 40 + 95;
  };

  const onTaskClick = () => {
    window.location.hash = '#tasks';
  };

  const onBadgeClick = () => {
    window.location.hash = '#badgesearned';
  };

  let totalEffort = calculateTotalTime(timeEntries, true);

  return (
    <Container fluid className="px-lg-0 bg--bar">
      <Row className="no-gutters row-eq-height">
        <Col
          className="d-flex justify-content-center align-items-center col-lg-2 col-12 text-list"
          align="center"
        >
          <div>
            <font className="text--black  align-middle" size="3">
              {' '}
              Activity for{' '}
            </font>
            <CardTitle className="text--black align-middle" tag="h3">
              <div>
                {firstName + ' '}
                {/* <br className="name-linebreak" /> */}
                {lastName}
              </div>
            </CardTitle>
          </div>
        </Col>
        <Col className="col-lg-3 col-12 no-gutters">
          <Row className="no-gutters">
            {totalEffort < weeklyComittedHours && (
              <div className="border-red col-4 bg--white-smoke" align="center">
                <div className="py-1"> </div>
                <p className="large_text_summary text--black text-danger" align="center">
                  !
                </p>
                <font className="text--black" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}
            {totalEffort >= weeklyComittedHours && (
              <div className="border-green col-4 bg--dark-green" align="center">
                <div className="py-1"> </div>
                <p className="large_text_summary text--black" align="center">
                  ✓
                </p>
                <font size="3">HOURS</font>
                <div className="py-2"> </div>
              </div>
            )}

            <div
              className="col-8 border-black bg--white-smoke d-flex justify-content-center align-items-center"
              align="center"
            >
              <div className="align-items-center" id="timelogweeklychart">
                <div className="text--black align-items-center med_text_summary">
                  Current Week : {totalEffort.toFixed(2)} / {weeklyComittedHours}
                  <Progress
                    value={getBarValue(totalEffort)}
                    className={getBarColor(totalEffort)}
                    striped={totalEffort < weeklyComittedHours}
                  />
                </div>
              </div>
            </div>
          </Row>
        </Col>

        <Col className="col-lg-3 col-12 no-gutters">
          <Row className="no-gutters">
            {!weeklySummary ? (
              <div className="border-red col-4 bg--white-smoke no-gutters" align="center">
                <div className="py-1"> </div>

                {matchUser || isAdmin ? (
                  <p
                    className={'summary-toggle large_text_summary text--black text-danger'}
                    align="center"
                    onClick={props.toggleSubmitForm}
                  >
                    !
                  </p>
                ) : (
                  <p
                    className={'summary-toggle large_text_summary text--black text-danger'}
                    align="center"
                  >
                    !
                  </p>
                )}

                <font className="text--black" size="3">
                  SUMMARY
                </font>
                <div className="py-2"> </div>
              </div>
            ) : (
              <div className="border-green col-4 bg--dark-green" align="center">
                <div className="py-1"> </div>
                <p className="large_text_summary text--black" align="center">
                  ✓
                </p>
                <font className="text--black" size="3">
                  SUMMARY
                </font>
                <div className="py-2"> </div>
              </div>
            )}

            {/* <div className="border-green col-sm-4 bg--dark-green" align="center">
              <div className="py-1"> </div>
              <h1 align="center">✓</h1>
              <font size="3">SUMMARY</font>
              <div className="py-2"> </div>
            </div> */}
            <div
              className="col-8 border-black bg--white-smoke d-flex align-items-center"
              align="center"
            >
              <div className="m-auto p-2">
                <font className="text--black med_text_summary align-middle" size="3">
                  {!weeklySummary ? (
                    <span className="summary-toggle" onClick={props.toggleSubmitForm}>
                      You still need to complete the weekly summary. Click here to submit it.
                    </span>
                  ) : (
                    'You have submitted your weekly summary.'
                  )}
                </font>
              </div>
            </div>
          </Row>
        </Col>
        {/* {isSubmitted && (<font className="text--black" align="center" size="3">
            You have completed weekly summary.
          </font>)}
          {!isSubmitted && (<font className="text--black" align="center" size="3">
            You still need to complete the weekly summary.
          </font>)} */}

        <Col className="m-auto mt-2 col-lg-4 col-12 badge-list">
          <div className="d-flex justify-content-around no-gutters">
            &nbsp;&nbsp;
            <div className="image_frame">
              <div className="redBackgroup">
                <span>{tasks}</span>
              </div>

              <img className="sum_img" src={task_icon} alt="" onClick={onTaskClick}></img>
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              <img className="sum_img" src={badges_icon} alt="" onClick={onBadgeClick} />
              <div className="redBackgroup">
                <span>{badges}</span>
              </div>
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              <Link to={`/userprofile/${_id}#bluesquare`}>
                <img className="sum_img" src={bluesquare_icon} alt="" />
                <div className="redBackgroup">
                  <span>{infringements}</span>
                </div>
              </Link>
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              <img className="sum_img" src={report_icon} alt="" onClick={openReport} />
              {/* <div className="blackBackgroup">
              <i className="fa fa-exclamation" aria-hidden="true" />
            </div> */}
            </div>
          </div>
        </Col>
        <Modal isOpen={report.in} toggle={openReport}>
          <ModalHeader>Bug Report</ModalHeader>
          <ModalBody>
            <Form onSubmit={sendBugReport} id="bugReportForm">
              <FormGroup>
                <Label for="title">[Feature Name] Bug Title </Label>
                <Input
                  type="textbox"
                  name="title"
                  id="title"
                  required
                  placeholder="Provide Concise Sumary Title..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="environment">
                  {' '}
                  Environment (OS/Device/App Version/Connection/Time etc){' '}
                </Label>
                <Input
                  type="textarea"
                  name="environment"
                  id="environment"
                  required
                  placeholder="Environment Info..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="reproduction">
                  Steps to reproduce (Please Number, Short Sweet to the point){' '}
                </Label>
                <Input
                  type="textarea"
                  name="reproduction"
                  id="reproduction"
                  required
                  placeholder="1. Click on the UserProfile Button in the Header..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="expected">Expected Result (Short Sweet to the point) </Label>
                <Input
                  type="textarea"
                  name="expected"
                  id="expected"
                  required
                  placeholder="What did you expect to happen?..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="actual">Actual Result (Short Sweet to the point) </Label>
                <Input
                  type="textarea"
                  name="actual"
                  id="actual"
                  required
                  placeholder="What actually happened?.."
                />
              </FormGroup>
              <FormGroup>
                <Label for="visual">Visual Proof (screenshots, videos, text) </Label>
                <Input
                  type="textarea"
                  name="visual"
                  id="visual"
                  required
                  placeholder="Links to screenshots etc..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="severity">Severity/Priority (How Bad is the Bug?) </Label>
                <Input type="select" name="severity" id="severity" required>
                  <option hidden disabled defaultValue value>
                    {' '}
                    -- select an option --{' '}
                  </option>
                  <option>1. High/Critical </option>
                  <option>2. Medium </option>
                  <option>3. Minor</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Button type="submit" color="primary" size="lg">
                  Submit
                </Button>{' '}
                &nbsp;&nbsp;&nbsp;
                <Button onClick={openReport} color="danger" size="lg">
                  Close
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </Row>
    </Container>
  );
};

export default SummaryBar;

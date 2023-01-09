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
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { ApiEndpoint } from 'utils/URL';
import hasPermission from 'utils/permissions';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';

const SummaryBar = props => {
  const { asUser, role, leaderData } = props;
  const [userProfile, setUserProfile] = useState(undefined);
  const [tasks, setTasks] = useState(undefined);
  const authenticateUser = useSelector(state => state.auth.user);
  const authenticateUserId = authenticateUser ? authenticateUser.userid : '';
  const { firstName, lastName, email, _id } = useSelector(state => state.userProfile);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);

  const matchUser = asUser == authenticateUserId ? true : false;
  const timeEntries = useSelector(state => {
    let timeEntries = state?.timeEntries?.weeks;
    if (timeEntries) {
      return timeEntries[0];
    } else {
      return [];
    }
  });

  // Similar to UserProfile component function
  // Loads component depending on asUser passed as prop
  const loadUserProfile = async () => {
    const userId = asUser;
    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
      console.log('User Profile loaded', newUserProfile);
      setUserProfile(newUserProfile);
    } catch (err) {
      console.log('User Profile not loaded.');
    }
  };

  const getUserTask = async () => {
    const userId = asUser;
    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.TASKS_BY_USERID(userId));
      const newUserTasks = response.data;
      console.log('User Tasks loaded');
      console.log(newUserTasks.length);
      setTasks(newUserTasks.length);
    } catch (err) {
      console.log('User Tasks not loaded.');
    }
  };

  useEffect(() => {
    loadUserProfile();
    getUserTask();
    // getWeeklySummary();
  }, []);
  }, [leaderData]);


  const calculateTotalTime = (data, isTangible) => {
    const filteredData = data.filter(entry => entry.isTangible === isTangible);

    const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
    return filteredData.reduce(reducer, 0);
  };
  // const weeklySummary = useSelector(state => {
  //   let summaries = state.userProfile?.weeklySummaries;
  //   if (summaries && Array.isArray(summaries) && summaries[0] && summaries[0].summary) {
  //     console.log('Yes weeklySummary');
  //     console.log(summaries[0].summary);
  //     return summaries[0].summary;
  //   } else {
  //     console.log('No weeklySummary');
  //     return '';
  //   }
  // });

  //Get infringement count from userProfile
  const getInfringements = user => {
    if (user && user.infringements) {
      return user.infringements.length;
    } else {
      return 0;
    }
  };

  //Get badges count from userProfile
  const getBadges = user => {
    if (user && user.badgeCollection) {
      return user.badgeCollection.length;
    } else {
      return 0;
    }
  };

  // const getTasks = user => {
  //   if (user && user.tasks) {
  //     return state.tasks.taskItems.length;
  //   } else {
  //     return 0;
  //   }
  // };

  const getState = useSelector(state => {
    return state;
  });

  const initialInfo = {
    in: false,
    information: '',
  };

  const [report, setBugReport] = useState(initialInfo);

  const openReport = () => {
    const htmlStr = ''; //str.split('\n').map((item, i) => <p key={i}>{item}</p>)
    setBugReport(info => ({
      ...info,
      in: !info.in,
      information: htmlStr,
    }));
  };

  const sendBugReport = event => {
    event.preventDefault();
    let bugReportForm = document.getElementById('bugReportForm');
    let formData = new FormData(bugReportForm);
    var data = {};
    formData.forEach(function(value, key) {
      data[key] = value;
    });
    data['firstName'] = firstName;
    data['lastName'] = lastName;
    data['email'] = email;

    httpService.post(`${ApiEndpoint}/dashboard/bugreport/${_id}`, data).catch(e => {});
    openReport();
  };

  // async componentDidMount() {
  //   await this.props.getWeeklySummaries(this.props.currentUser.userid);
  //   const { weeklySummariesCount } = this.props.summaries;}

  const onTaskClick = () => {
    window.location.hash = '#tasks';
  };

  const onBadgeClick = () => {
    window.location.hash = '#badgesearned';
  };

  const getWeeklySummary = user => {
    let summaries = user.weeklySummaries;
    const timeNow = new Date();
    const latestSummaryDueDate = new Date(summaries[0].dueDate);

    if (
      summaries &&
      Array.isArray(summaries) &&
      summaries[0] &&
      summaries[0].summary &&
      timeNow < latestSummaryDueDate
    ) {
      return summaries[0].summary;
    } else {
      return '';
    }
  };

  if (userProfile !== undefined && leaderData !== undefined) {
    const infringements = getInfringements(userProfile);
    const badges = getBadges(userProfile);
    console.log(tasks);
    const { firstName, lastName, email, _id } = userProfile;
    let totalEffort = parseFloat(leaderData.find(x => x.personId === asUser).tangibletime);
    const weeklyCommittedHours = userProfile.weeklyComittedHours;
    const weeklySummary = getWeeklySummary(userProfile);
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
              {totalEffort < weeklyCommittedHours && (
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
              {totalEffort >= weeklyCommittedHours && (
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
                    Current Week : {totalEffort.toFixed(2)} / {weeklyCommittedHours}
                    <Progress
                      value={getProgressValue(totalEffort,weeklyCommittedHours)}
                      color={getProgressColor(totalEffort,weeklyCommittedHours)}
                      striped={totalEffort < weeklyCommittedHours}
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
                  {matchUser || hasPermission(role, 'toggleSubmitForm') ? (
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
                    {weeklySummary || props.submittedSummary ? (
                      'You have submitted your weekly summary.'
                    ) : (
                      <span className="summary-toggle" onClick={props.toggleSubmitForm}>
                        You still need to complete the weekly summary. Click here to submit it.
                      </span>
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
  } else {
    return <div>Loading</div>;
  }
};

export default SummaryBar;

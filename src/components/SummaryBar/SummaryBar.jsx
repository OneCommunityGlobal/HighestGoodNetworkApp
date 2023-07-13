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
import suggestions_icon from './suggestions_icon.png';
import httpService from '../../services/httpService';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { ApiEndpoint } from 'utils/URL';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import hasPermission from 'utils/permissions';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { toast } from 'react-toastify';

const SummaryBar = props => {
  const { asUser, role, summaryBarData } = props;
  const [userProfile, setUserProfile] = useState(undefined);
  const [infringements, setInfringements] = useState(0);
  const [badges, setBadges] = useState(0);
  const [totalEffort, setTotalEffort] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState([]);

  const [tasks, setTasks] = useState(undefined);
  const authenticateUser = useSelector(state => state.auth.user);
  const gsUserprofile = useSelector(state => state.userProfile);
  const gsUserTasks = useSelector(state => state.userTask);
  const roles = useSelector(state => state.role.roles);
  const authenticateUserId = authenticateUser ? authenticateUser.userid : '';
  const authenticateUserPermission = authenticateUser
    ? authenticateUser.permissions?.frontPermissions
    : [];

  const matchUser = asUser == authenticateUserId ? true : false;

  // Similar to UserProfile component function
  // Loads component depending on asUser passed as prop
  const loadUserProfile = async () => {
    const userId = asUser;
    if (!userId) return;

    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
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
      setTasks(newUserTasks.length);
    } catch (err) {
      console.log('User Tasks not loaded.');
    }
  };

  useEffect(() => {
    // Fetch user profile only if the selected timelog is of different user
    if (!matchUser || gsUserprofile._id != asUser) {
      loadUserProfile();
      getUserTask();
    } else {
      setUserProfile(gsUserprofile);
      setTasks(gsUserTasks.length);
    }
  }, [asUser]);

  useEffect(() => {
    if (summaryBarData && userProfile !== undefined) {
      setInfringements(getInfringements());
      setBadges(getBadges());
      setTotalEffort(summaryBarData.tangibletime);
      setWeeklySummary(getWeeklySummary(userProfile));
    }
  }, [userProfile, summaryBarData]);

  //Get infringement count from userProfile
  const getInfringements = () => {
    return userProfile && userProfile.infringements ? userProfile.infringements.length : 0;
  };

  //Get badges count from userProfile
  const getBadges = () => {
    return userProfile && userProfile.badgeCollection ? userProfile.badgeCollection.length : 0;
  };

  const getState = useSelector(state => {
    return state;
  });

  const initialInfo = {
    in: false,
    information: '',
  };

  const [suggestionCategory, setSuggestionCategory] = useState([]);
  const [inputFiled, setInputField] = useState([]);
  const [takeInput, setTakeInput] = useState(false);
  const [extraFieldForSuggestionForm, setExtraFieldForSuggestionForm] = useState('')
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [report, setBugReport] = useState(initialInfo);

//refactored for rading form values
  const readFormData = (formid) =>{
    let form = document.getElementById(formid);
    let formData = new FormData(form);
    var data = {};
    formData.forEach(function(value, key) {
      data[key] = value;
    });
    return data;
  }

  const openReport = () => {
    const htmlStr = ''; 
    setBugReport(info => ({
      ...info,
      in: !info.in,
      information: htmlStr,
    }));
  };

  const sendBugReport = event => {
    event.preventDefault();
    const data = readFormData('bugReportForm')
    data['firstName'] = userProfile.firstName;
    data['lastName'] = userProfile.lastName;
    data['email'] = userProfile.email;

    httpService.post(`${ApiEndpoint}/dashboard/bugreport/${userProfile._id}`, data).catch(e => {});
    openReport();
  };
//
  const setnewfields = (fielddata, setfield) =>{
    setfield(prev =>{
      let newarr = prev;
      newarr.unshift(fielddata.newField);
      return newarr;
    });
  }
 //add new text field or suggestion category by owner class and update the backend
  const addField = async (event) =>{
    event.preventDefault();
    const data = readFormData('newFieldForm')
    if(extraFieldForSuggestionForm === 'suggestion'){
      data.suggestion = true;
      data.field = false;
      setnewfields(data, setSuggestionCategory)
    }else if(extraFieldForSuggestionForm === 'field'){
      data.suggestion = false;
      data.field = true
      setnewfields(data, setInputField)
    }
    setExtraFieldForSuggestionForm('')
    httpService.post(`${ApiEndpoint}//dashboard/suggestionoption/${userProfile._id}`, data).catch(e => {});
  }

  const sendUserSuggestion = async event =>{
    event.preventDefault();
    const data = readFormData('suggestionForm')
    setShowSuggestionModal(prev => !prev)
    const res = await httpService.post(`${ApiEndpoint}//dashboard/makesuggestion/${userProfile._id}`, data).catch(e => {});
    if(res.status === 200){
      toast.success('Email sent successfully!')
    }else{
       toast.error('Failed to send email!')
    }
  }
 
  const openSuggestionModal = async () => {
    if(!showSuggestionModal){
      let res = await httpService.get(`${ApiEndpoint}//dashboard/suggestionoption/${userProfile._id}`).catch(e => {});
      if(res.status == 200){
          setSuggestionCategory(res.data.suggestion);
          setInputField(res.data.field);  
      }
    }
    setShowSuggestionModal(prev => !prev)
  }

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

  const authenticateUserRole = authenticateUser ? authenticateUser.role : '';
  if (userProfile !== undefined && summaryBarData !== undefined) {
    const weeklyCommittedHours = userProfile.weeklycommittedHours + (userProfile.missedHours ?? 0);
    const weeklySummary = getWeeklySummary(userProfile);
    return (
      <Container
        fluid
        className={
          matchUser ||
          hasPermission(
            authenticateUserRole,
            'submitWeeklySummaryForOthers',
            roles,
            authenticateUserPermission,
          )
            ? 'px-lg-0 bg--bar'
            : 'px-lg-0 bg--bar disabled-bar'
        }
      >
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
                  {userProfile.firstName + ' '}
                  {userProfile.lastName}
                </div>
              </CardTitle>
            </div>
          </Col>
          <Col className="d-flex col-lg-3 col-12 no-gutters">
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
                      value={getProgressValue(totalEffort, weeklyCommittedHours)}
                      color={getProgressColor(totalEffort, weeklyCommittedHours)}
                      striped={totalEffort < weeklyCommittedHours}
                    />
                  </div>
                </div>
              </div>
            </Row>
          </Col>

          <Col className="d-flex col-lg-3 col-12 no-gutters">
            <Row className="no-gutters">
              {!weeklySummary ? (
                <div className="border-red col-4 bg--white-smoke no-gutters" align="center">
                  <div className="py-1"> </div>
                  {matchUser ||
                  hasPermission(
                    authenticateUserRole,
                    'submitWeeklySummaryForOthers',
                    roles,
                    authenticateUserPermission,
                  ) ? (
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

              <div
                className="col-8 border-black bg--white-smoke d-flex align-items-center"
                align="center"
              >
                <div className="m-auto p-2">
                  <font className="text--black med_text_summary align-middle" size="3">
                    {weeklySummary || props.submittedSummary ? (
                      'You have submitted your weekly summary.'
                    ) : matchUser ? (
                      <span className="summary-toggle" onClick={props.toggleSubmitForm}>
                        You still need to complete the weekly summary. Click here to submit it.
                      </span>
                    ) : (
                      <span className="summary-toggle">
                        You still need to complete the weekly summary. Click here to submit it.
                      </span>
                    )}
                  </font>
                </div>
              </div>
            </Row>
          </Col>

          <Col className="m-auto mt-2 col-lg-4 col-12 badge-list">
            <div className="d-flex justify-content-around no-gutters">
              &nbsp;&nbsp;
              <div className="image_frame">
                <div className="redBackgroup">
                  <span>{tasks}</span>
                </div>
                {matchUser ? (
                  <img className="sum_img" src={task_icon} alt="" onClick={onTaskClick}></img>
                ) : (
                  <img className="sum_img" src={task_icon} alt=""></img>
                )}
              </div>
              &nbsp;&nbsp;
              <div className="image_frame">
                {matchUser ? (
                  <img className="sum_img" src={badges_icon} alt="" onClick={onBadgeClick} />
                ) : (
                  <img className="sum_img" src={badges_icon} alt="" />
                )}
                <div className="redBackgroup">
                  <span>{badges}</span>
                </div>
              </div>
              &nbsp;&nbsp;
              <div className="image_frame">
                {matchUser ? (
                  <Link to={`/userprofile/${userProfile._id}#bluesquare`}>
                    <img className="sum_img" src={bluesquare_icon} alt="" />
                    <div className="redBackgroup">
                      <span>{infringements}</span>
                    </div>
                  </Link>
                ) : (
                  <div>
                    <img className="sum_img" src={bluesquare_icon} alt="" />
                    <div className="redBackgroup">
                      <span>{infringements}</span>
                    </div>
                  </div>
                )}
              </div>
              &nbsp;&nbsp;
              <div className="image_frame">
                {matchUser ? (
                  <img className="sum_img" src={report_icon} alt="" onClick={openReport} />
                ) : (
                  <img className="sum_img" src={report_icon} alt="" />
                )}
              </div>
              &nbsp;&nbsp;
              <div className="image_frame">
                {matchUser ? (
                  <img className="sum_img" src={suggestions_icon} alt="" onClick={openSuggestionModal} />
                ) : (
                  <img className="sum_img" src={suggestions_icon} alt="" />
                )}
              </div>
            </div>
          </Col>

          <Modal isOpen={showSuggestionModal} toggle={openSuggestionModal}>
            <ModalHeader>User Suggestion</ModalHeader>
            <ModalBody>
              {userProfile.role === 'Administrator' && !extraFieldForSuggestionForm &&
                <FormGroup>
                  <Button onClick={()=> setExtraFieldForSuggestionForm('suggestion')} type="button" color="success" size="md">
                    Add new category
                  </Button>{' '}
                  &nbsp;&nbsp;&nbsp;
                  <Button  onClick={()=> setExtraFieldForSuggestionForm('field')} type="button" color="success" size="md">
                    Add new field
                  </Button>
                </FormGroup>
              }
               
              {extraFieldForSuggestionForm &&
                 <Form onSubmit={addField} id="newFieldForm" style={{border:'1px solid gray', padding:'5px 10px', margin: '5px 10px'}}>
                    <FormGroup>
                      <Label for="newField">{extraFieldForSuggestionForm === 'field' ? 'Add Field Name' : 'Add suggestion category'}</Label>
                        <Input
                          type="textarea"
                          name="newField"
                          id="newField"
                          required
                        /> 
                    </FormGroup>
                    <Button type="submit" color="success" size="md">
                       Add
                    </Button>{' '}
                    &nbsp;&nbsp;&nbsp;
                    <Button onClick={()=>  setExtraFieldForSuggestionForm('')} type="button" color="danger" size="md">
                       cancel
                    </Button>
                 </Form>
              }
              <Form onSubmit={sendUserSuggestion} id="suggestionForm">
                <FormGroup>
                  <Label for="suggestioncate">Please select a category of your suggestion:</Label>
                  <Input onChange={()=> setTakeInput(true)} type="select" name="suggestioncate" id="suggestioncate" required>
                    <option disabled value selected>
                      {' '}
                      -- select an option --{' '}
                    </option>
                    {suggestionCategory.map((item,index) => {
                        return <option value={item}>{`${index+1}. ${item}`}</option>
                    })}
                  </Input>
                </FormGroup>
                  {takeInput &&
                  <FormGroup>
                  <Label for="suggestion">
                    {' '}
                    Write your suggestion.{' '}
                  </Label>
                  <Input
                    type="textarea"
                    name="suggestion"
                    id="suggestion"
                    required
                    placeholder="I suggest ..."
                  />
                 </FormGroup>}
                {inputFiled.length > 0 && inputFiled.map(item =>
                  <FormGroup>
                  <Label for="title">{item} </Label>
                  <Input
                    type="textbox"
                    name={item}
                    id={item}
                    required
                    placeholder=""
                  />
                 </FormGroup>
                )}
                <FormGroup tag="fieldset" id='fieldset'>
                  <legend style={{fontSize:'16px'}}>Would you like a followup/reply regarding this feedback?</legend>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" name="confirm" value={'yes'}/> Yes
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="radio" name="confirm" value={'no'}/> No
                    </Label>
                  </FormGroup>
                </FormGroup>
                <FormGroup>
                  <Button type="submit" color="primary" size="lg">
                    Submit
                  </Button>{' '}
                  &nbsp;&nbsp;&nbsp;
                  <Button onClick={()=> setShowSuggestionModal(prev => !prev)} color="danger" size="lg">
                    Close
                  </Button>
                </FormGroup>
              </Form>
            </ModalBody>
          </Modal>

          <Modal  isOpen={report.in} toggle={openReport} >
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

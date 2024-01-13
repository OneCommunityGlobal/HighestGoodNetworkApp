import React, { useState, useEffect, useRef } from 'react';
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
import { connect, useSelector } from 'react-redux';
import { HashLink as Link } from 'react-router-hash-link';
import './SummaryBar.css';
import task_icon from './task_icon.png';
import badges_icon from './badges_icon.png';
import bluesquare_icon from './bluesquare_icon.png';
import report_icon from './report_icon.png';
import suggestions_icon from './suggestions_icon.png';
import httpService from '../../services/httpService';
import { ENDPOINTS, ApiEndpoint } from 'utils/URL';
import axios from 'axios';

import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import hasPermission from 'utils/permissions';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { toast } from 'react-toastify';

const SummaryBar = props => {
  // from parent
  const { displayUserId, summaryBarData } = props;
  // from store
  const { authUser, displayUserProfile, displayUserTask } = props;

  const authId = authUser.userid;
  const isAuthUser = displayUserId === authId;
  const initialInfo = {
    in: false,
    information: '',
  };
  const weeklyCommittedHours =
    displayUserProfile?.weeklycommittedHours + (displayUserProfile?.missedHours ?? 0);

  const [userProfile, setUserProfile] = useState(undefined);
  const [infringements, setInfringements] = useState(0);
  const [badges, setBadges] = useState(0);
  const [totalEffort, setTotalEffort] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [tasks, setTasks] = useState(undefined);

  const [categoryDescription, setCategoryDescription] = useState();
  const sortableContainerRef = useRef(null);

  const editRadioButtonSelected = value => {
    // dynamic way to set description rather than using tenerary operators.

    setEditType(value);

    if (value === 'add') {
      setCategoryDescription('Add Category');
    } else if (value === 'edit') {
      setCategoryDescription('Edit Categories');
    } else if (value === 'delete') {
      setCategoryDescription(
        'Delete category (Write the suggestion category number from the dropdown to delete it).',
      );
    }
  };

  const onDragToggleDraggingClass = event => {
    event.currentTarget.classList.toggle('sortable-draggable-dragging');
  };

  const onSortableDragOver = event => {
    event.preventDefault();
    const draggedElement = event.currentTarget.querySelector('.sortable-draggable-dragging');
    const nextElement = getDraggedNextElement(sortableContainerRef.current, event.clientY);

    if (nextElement == null && draggedElement) {
      sortableContainerRef.current.appendChild(draggedElement);
    } else {
      sortableContainerRef.current.insertBefore(draggedElement, nextElement);
    }
  };

  const getDraggedNextElement = (container, yMouse) => {
    // grab all draggable elements that are not being dragged.
    const draggableElements = [
      ...container.querySelectorAll('.sortable-draggable:not(.sortable-dragging)'),
    ];

    // below uses the array of draggable elements and uses the offset to find the closest draggable element after
    // the element is dragged
    if (draggableElements) {
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = yMouse - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY },
      ).element;
    }
  };

  const handleEditClick = event => {
    let currentTarget = event.currentTarget;

    if (currentTarget) {
      const parentEditableBool = currentTarget.parentNode.contentEditable === 'true';
      currentTarget.parentNode.contentEditable = !parentEditableBool;
      currentTarget.contentEditable = false;
      currentTarget.parentNode.style.cursor = 'grab';

      if (!parentEditableBool) {
        // Assuming the text node is the first child
        const textNode = currentTarget.parentNode.childNodes[0];
        const range = document.createRange();
        const selection = window.getSelection();

        range.setStart(textNode, textNode.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        event.currentTarget.parentNode.style.cursor = 'text';
        currentTarget.parentNode.focus();
      }

      currentTarget.classList.toggle('fa-edit');
      currentTarget.classList.toggle('fa-check');
    }
  };

  const [suggestionCategory, setSuggestionCategory] = useState([]);
  const [inputFiled, setInputField] = useState([]);
  const [takeInput, setTakeInput] = useState(false);
  const [extraFieldForSuggestionForm, setExtraFieldForSuggestionForm] = useState('');
  const [editType, setEditType] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [report, setBugReport] = useState(initialInfo);

  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');

  // Similar to UserProfile component function
  // Loads component depending on displayUserId passed as prop
  const loadUserProfile = async () => {
    const userId = displayUserId;
    if (!userId) return;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
      setUserProfile(newUserProfile);
    } catch (err) {
      console.log('User Profile not loaded.');
    }
  };

  const getUserTasks = async () => {
    const userId = displayUserId;
    if (!userId) return;
    try {
      const response = await axios.get(ENDPOINTS.TASKS_BY_USERID(userId));
      const newUserTasks = response.data;
      setTasks(newUserTasks.length);
    } catch (err) {
      console.log('User Tasks not loaded.');
    }
  };

  //Get infringement count from userProfile
  const getInfringements = () => {
    return displayUserProfile && displayUserProfile.infringements
      ? displayUserProfile.infringements.length
      : 0;
  };

  //Get badges count from userProfile
  const getBadges = () => {
    if (!displayUserProfile || !displayUserProfile.badgeCollection) {
      return 0;
    }
    let totalBadges = 0;
    displayUserProfile.badgeCollection.forEach(badge => {
      if (badge?.badge?.badgeName === 'Personal Max' || badge?.badge?.type === 'Personal Max') {
        totalBadges += 1;
      } else {
        totalBadges += Math.round(Number(badge.count));
      }
    });

    return totalBadges;
  };

  //refactored for rading form values
  const readFormData = formid => {
    let form = document.getElementById(formid);
    let formData = new FormData(form);
    let data = {};
    let isvalid = true;
    formData.forEach(function(value, key) {
      if (value.trim() !== '') {
        data[key] = value;
      } else {
        isvalid = false;
      }
    });

    if (data && data.action && data.action == 'edit') {
      const updatedSuggestionCategory = Array.from(sortableContainerRef.current.children).map(
        child => {
          return child.textContent;
        },
      );

      updatedSuggestionCategory.forEach(function(value, key) {
        if (value.trim() === '') {
          isvalid = false;
        }
      });

      data.updatedSuggestionCategory = updatedSuggestionCategory;
    }

    return isvalid ? data : null;
  };

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
    const data = readFormData('bugReportForm');
    data['firstName'] = displayUserProfile.firstName;
    data['lastName'] = displayUserProfile.lastName;
    data['email'] = displayUserProfile.email;
    httpService
      .post(`${ApiEndpoint}/dashboard/bugreport/${displayUserProfile._id}`, data)
      .catch(e => {});
    openReport();
  };

  const setnewfields = (fielddata, setfield) => {
    if (fielddata?.action == 'edit' && fielddata?.updatedSuggestionCategory) {
      setfield(fielddata.updatedSuggestionCategory);
    } else {
      setfield(prev => {
        let newarr = [...prev];
        if (fielddata.action === 'add') newarr.unshift(fielddata.newField);
        if (fielddata.action === 'delete') {
          newarr = newarr.filter((item, index) => {
            return fielddata.field
              ? fielddata.newField !== item
              : +fielddata.newField !== index + 1;
          });
        }
        return newarr;
      });
    }
  };
  //add new text field or suggestion category by owner class and update the backend
  const editField = async event => {
    event.preventDefault();
    const data = readFormData('newFieldForm');
    if (data) {
      if (extraFieldForSuggestionForm === 'suggestion') {
        data.suggestion = true;
        data.field = false;
        setnewfields(data, setSuggestionCategory);
      } else if (extraFieldForSuggestionForm === 'field') {
        data.suggestion = false;
        data.field = true;
        setnewfields(data, setInputField);
      }
      setExtraFieldForSuggestionForm('');
      setEditType('');
      httpService
        .post(`${ApiEndpoint}/dashboard/suggestionoption/${displayUserProfile._id}`, data)
        .catch(e => {});
    } else {
      toast.error('Please fill all fields with valid values.');
    }
  };

  const sendUserSuggestion = async event => {
    event.preventDefault();
    const data = readFormData('suggestionForm');
    data['firstName'] = displayUserProfile.firstName;
    data['lastName'] = displayUserProfile.lastName;
    data['email'] = displayUserProfile.email;
    if (data) {
      setShowSuggestionModal(prev => !prev);
      const res = await httpService
        .post(`${ApiEndpoint}/dashboard/makesuggestion/${displayUserProfile._id}`, data)
        .catch(e => {});
      if (res.status === 200) {
        toast.success('Email sent successfully!');
      } else {
        toast.error('Failed to send email!');
      }
    } else {
      toast.error('Please fill all fields with valid values.');
    }
  };

  const openSuggestionModal = async () => {
    if (!showSuggestionModal) {
      try {
        let res = await httpService.get(
          `${ApiEndpoint}/dashboard/suggestionoption/${displayUserProfile._id}`,
        );
        if (res && res.status === 200) {
          setSuggestionCategory(res.data.suggestion);
          setInputField(res.data.field);
        } else {
          console.error(res.status);
          // Handle the error as needed
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle the error
      }
    }
    setShowSuggestionModal(prev => !prev);
  };

  const onTaskClick = () => {
    window.location.hash = '#tasks';
  };

  const onBadgeClick = () => {
    window.location.hash = '#badgesearned';
  };

  const getWeeklySummary = user => {
    const latestSummary = user?.weeklySummaries?.[0];
    return latestSummary && new Date() < new Date(latestSummary.dueDate)
      ? latestSummary.summary
      : '';
  };

  useEffect(() => {
    setUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    // Fetch user profile only if the selected timelog is of different user
    if (!isAuthUser) {
      loadUserProfile();
      getUserTasks();
    } else {
      setUserProfile(userProfile);
      setTasks(displayUserTask.length);
    }
  }, [displayUserId]);

  useEffect(() => {
    if (summaryBarData && displayUserProfile !== undefined) {
      setInfringements(getInfringements());
      setBadges(getBadges());
      setTotalEffort(summaryBarData.tangibletime);
      setWeeklySummary(getWeeklySummary(displayUserProfile));
    }
  }, [displayUserProfile, summaryBarData]);

  return displayUserProfile !== undefined && summaryBarData !== undefined ? (
    <Container
      fluid
      className={
        isAuthUser || canPutUserProfileImportantInfo
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
                {displayUserProfile.firstName + ' '}
                {displayUserProfile.lastName}
              </div>
            </CardTitle>
          </div>
        </Col>
        <Col className="d-flex col-lg-3 col-12 no-gutters">
          <Row className="no-gutters w-100">
            {totalEffort < weeklyCommittedHours && (
              <div className="border-red col-4 bg--white-smoke">
                <div className="py-1"> </div>
                <p className="text-center large_text_summary text--black text-danger">!</p>
                <font className="text-center text--black" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}
            {totalEffort >= weeklyCommittedHours && (
              <div className="border-green col-4 bg--dark-green">
                <div className="py-1"> </div>
                <p className="text-center large_text_summary text--black">✓</p>
                <font className="text-center" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}

            <div className="col-8 border-black bg--white-smoke d-flex justify-content-center align-items-center">
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
          <Row className="no-gutters w-100">
            {!weeklySummary ? (
              <div className="border-red col-4 bg--white-smoke no-gutters">
                <div className="py-1"> </div>
                {isAuthUser || canPutUserProfileImportantInfo ? (
                  <p
                    className={
                      'text-center summary-toggle large_text_summary text--black text-danger'
                    }
                    onClick={props.toggleSubmitForm}
                  >
                    !
                  </p>
                ) : (
                  <p
                    className={
                      'text-center summary-toggle large_text_summary text--black text-danger'
                    }
                  >
                    !
                  </p>
                )}

                <font className="text-center text--black" size="3">
                  SUMMARY
                </font>
                <div className="py-2"> </div>
              </div>
            ) : (
              <div className="border-green col-4 bg--dark-green">
                <div className="py-1"> </div>
                <p
                  onClick={props.toggleSubmitForm}
                  className="text-center large_text_summary text--black summary-toggle"
                >
                  ✓
                </p>
                <font className="text-center text--black" size="3">
                  SUMMARY
                </font>
                <div className="py-2"> </div>
              </div>
            )}

            <div className="col-8 border-black bg--white-smoke d-flex align-items-center">
              <div className="m-auto p-2 text-center">
                <font
                  onClick={props.toggleSubmitForm}
                  className="text--black med_text_summary align-middle summary-toggle"
                  size="3"
                >
                  {weeklySummary || props.submittedSummary ? (
                    'You have submitted your weekly summary.'
                  ) : isAuthUser ? (
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
              {isAuthUser ? (
                <img className="sum_img" src={task_icon} alt="" onClick={onTaskClick}></img>
              ) : (
                <img className="sum_img" src={task_icon} alt=""></img>
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              {isAuthUser ? (
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
              {isAuthUser ? (
                <Link to={`/userprofile/${displayUserProfile._id}#bluesquare`}>
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
              {isAuthUser ? (
                <img className="sum_img" src={report_icon} alt="" onClick={openReport} />
              ) : (
                <img className="sum_img" src={report_icon} alt="" />
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              {isAuthUser ? (
                <img
                  className="sum_img"
                  src={suggestions_icon}
                  alt=""
                  onClick={openSuggestionModal}
                />
              ) : (
                <img className="sum_img" src={suggestions_icon} alt="" />
              )}
            </div>
          </div>
        </Col>

        <Modal isOpen={showSuggestionModal} toggle={openSuggestionModal}>
          <ModalHeader>User Suggestion</ModalHeader>
          <ModalBody>
            {displayUserProfile.role === 'Owner' && !extraFieldForSuggestionForm && (
              <FormGroup>
                <Button
                  onClick={() => setExtraFieldForSuggestionForm('suggestion')}
                  type="button"
                  color="success"
                  size="md"
                >
                  Edit Category
                </Button>{' '}
                &nbsp;&nbsp;&nbsp;
                <Button
                  onClick={() => setExtraFieldForSuggestionForm('field')}
                  type="button"
                  color="success"
                  size="md"
                >
                  Edit Field
                </Button>
              </FormGroup>
            )}

            {extraFieldForSuggestionForm && (
              <Form
                onSubmit={editField}
                id="newFieldForm"
                style={{ border: '1px solid gray', padding: '5px 10px', margin: '5px 10px' }}
              >
                <FormGroup tag="fieldset" id="fieldsetinner">
                  <legend style={{ fontSize: '16px' }}>Select Action type:</legend>
                  <FormGroup check>
                    <Label check>
                      <Input
                        onChange={e => editRadioButtonSelected(e.target.value)}
                        type="radio"
                        name="action"
                        value={'add'}
                        required
                      />{' '}
                      Add
                    </Label>
                  </FormGroup>
                  {extraFieldForSuggestionForm === 'suggestion' && (
                    <FormGroup check>
                      <Label check>
                        <Input
                          onChange={e => editRadioButtonSelected(e.target.value)}
                          type="radio"
                          name="action"
                          value={'edit'}
                          required
                        />{' '}
                        Edit
                      </Label>
                    </FormGroup>
                  )}
                  <FormGroup check>
                    <Label check>
                      <Input
                        onChange={e => editRadioButtonSelected(e.target.value)}
                        type="radio"
                        name="action"
                        value={'delete'}
                        required
                        disabled={
                          extraFieldForSuggestionForm === 'field' && inputFiled.length === 0
                        }
                      />{' '}
                      Delete
                    </Label>
                  </FormGroup>
                </FormGroup>
                {editType !== '' && (
                  <FormGroup>
                    <Label for="newField">
                      {extraFieldForSuggestionForm === 'suggestion' && categoryDescription}
                    </Label>
                    {editType !== 'edit' && (
                      <Input
                        type="textarea"
                        name="newField"
                        id="newField"
                        placeholder={
                          extraFieldForSuggestionForm === 'suggestion'
                            ? editType === 'delete'
                              ? 'write the category number, like 1 or 2 etc'
                              : 'write the category name'
                            : 'write the field name'
                        }
                        required
                      />
                    )}
                    {editType === 'edit' && (
                      <div
                        className="sortable-container"
                        ref={sortableContainerRef}
                        onDragOver={e => onSortableDragOver(e)}
                      >
                        {suggestionCategory.map((value, index) => (
                          <p
                            key={index}
                            className="sortable-content sortable-draggable"
                            draggable="true"
                            onDragStart={event => onDragToggleDraggingClass(event)}
                            onDragEnd={event => onDragToggleDraggingClass(event)}
                          >
                            {value}
                            <span
                              className="edit-icon fa fa-edit"
                              onClick={event => handleEditClick(event)}
                            ></span>
                          </p>
                        ))}
                      </div>
                    )}
                  </FormGroup>
                )}
                <Button id="add" type="submit" color="success" size="md">
                  Submit
                </Button>{' '}
                &nbsp;&nbsp;&nbsp;
                <Button
                  onClick={() => {
                    setEditType('');
                    setExtraFieldForSuggestionForm('');
                  }}
                  type="button"
                  color="danger"
                  size="md"
                >
                  Cancel
                </Button>
              </Form>
            )}
            <Form onSubmit={sendUserSuggestion} id="suggestionForm">
              <FormGroup>
                <Label for="suggestioncate">Please select a category of your suggestion:</Label>

                <Input
                  onChange={() => setTakeInput(true)}
                  type="select"
                  name="suggestioncate"
                  id="suggestioncate"
                  defaultValue={''}
                  required
                >
                  <option disabled value="" hidden>
                    {' '}
                    -- select an option --{' '}
                  </option>
                  {suggestionCategory.map((item, index) => {
                    return <option key={index} value={item}>{`${index + 1}. ${item}`}</option>;
                  })}
                </Input>
              </FormGroup>
              {takeInput && (
                <FormGroup>
                  <Label for="suggestion"> Write your suggestion: </Label>
                  <Input
                    type="textarea"
                    name="suggestion"
                    id="suggestion"
                    placeholder="I suggest ..."
                    required
                  />
                </FormGroup>
              )}
              {inputFiled.length > 0 &&
                inputFiled.map((item, index) => (
                  <FormGroup key={index}>
                    <Label for="title">{item} </Label>
                    <Input type="textbox" name={item} id={item} placeholder="" required />
                  </FormGroup>
                ))}
              <FormGroup tag="fieldset" id="fieldset">
                <legend style={{ fontSize: '16px' }}>
                  Would you like a followup/reply regarding this feedback?
                </legend>
                <FormGroup check>
                  <Label check>
                    <Input type="radio" name="confirm" value={'yes'} required /> Yes
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input type="radio" name="confirm" value={'no'} required /> No
                  </Label>
                </FormGroup>
              </FormGroup>
              <FormGroup>
                <Button type="submit" color="primary" size="lg">
                  Submit
                </Button>{' '}
                &nbsp;&nbsp;&nbsp;
                <Button
                  onClick={() => setShowSuggestionModal(prev => !prev)}
                  color="danger"
                  size="lg"
                >
                  Close
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>

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
                <Input type="select" name="severity" id="severity" defaultValue={''} required>
                  <option hidden value="" disabled>
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
  ) : (
    <div>Loading</div>
  );
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
  displayUserTask: state.userTask,
});

export default connect(mapStateToProps, { hasPermission })(SummaryBar);

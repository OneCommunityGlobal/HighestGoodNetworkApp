import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  CardTitle,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Progress,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { connect } from 'react-redux';
import { HashLink as Link } from 'react-router-hash-link';
import './SummaryBar.css';
import { ENDPOINTS, ApiEndpoint } from 'utils/URL';
import axios from 'axios';
import hasPermission from 'utils/permissions';
import { toast } from 'react-toastify';
import TaskIcon from './task_icon.png';
import BadgesIcon from './badges_icon.png';
import BlueScoreIcon from './bluesquare_icon.png';
import ReportIcon from './report_icon.png';
import SuggestionsIcon from './suggestions_icon.png';
import httpService from '../../services/httpService';

import { getProgressColor, getProgressValue } from '../../utils/effortColors';

function SummaryBar(props) {
  // from parent
  const { displayUserId, summaryBarData } = props;
  // from store
  const { authUser, displayUserProfile, displayUserTask, darkMode } = props;

  const authId = authUser.userid;
  const isAuthUser = displayUserId === authId;
  const initialInfo = {
    in: false,
    information: '',
  };

  const committedHours = displayUserProfile?.weeklycommittedHours ?? 0;
  const missedHours = displayUserProfile?.missedHours ?? 0;
  const weeklyCommittedHours = committedHours + missedHours;

  const [userProfile, setUserProfile] = useState(undefined);
  const [infringements, setInfringements] = useState(0);
  const [badges, setBadges] = useState(0);
  const [totalEffort, setTotalEffort] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [tasks, setTasks] = useState(undefined);

  const [suggestionCategory, setSuggestionCategory] = useState([]);
  const [inputFiled, setInputField] = useState([]);
  const [takeInput, setTakeInput] = useState(false);
  const [extraFieldForSuggestionForm, setExtraFieldForSuggestionForm] = useState('');
  const [editType, setEditType] = useState('');
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [report, setBugReport] = useState(initialInfo);

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
    } else {
      setCategoryDescription('');
    }
  };

  const closeSuggestionModal = () => {
    editRadioButtonSelected('');
    setExtraFieldForSuggestionForm('');
  };

  const onDragToggleDraggingClass = event => {
    event.currentTarget.classList.toggle('sortable-draggable-dragging');
  };

  const getDraggedNextElement = (container, yMouse) => {
    // grab all draggable elements that are not being dragged.
    const draggableElements = [
      ...container.querySelectorAll('.sortable-draggable:not(.sortable-dragging)'),
    ];

    // below uses the array of draggable elements and uses the offset to find the closest draggable element after
    // the element is dragged
    if (draggableElements.length > 0) {
      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = yMouse - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
          }
          return closest;
        },
        { offset: Number.NEGATIVE_INFINITY },
      ).element;
    }
    // Default return if no draggable elements found
    return null;
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

  const handleEditClick = event => {
    const { currentTarget } = event;

    if (currentTarget) {
      const textNode = currentTarget.parentNode.querySelector('p');

      if (currentTarget.classList.contains('fa-edit') && textNode) {
        // Going to edit mode
        textNode.contentEditable = true;
        currentTarget.parentNode.draggable = false;
        currentTarget.parentNode.style.cursor = 'default';

        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(textNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);

        textNode.style.cursor = 'text';
        textNode.focus();
      } else if (textNode) {
        // Going to draggable mode
        textNode.style.cursor = 'grab';
        currentTarget.parentNode.draggable = true;
        currentTarget.parentNode.style.cursor = 'grab';
      }

      currentTarget.classList.toggle('fa-edit');
      currentTarget.classList.toggle('fa-check');
    }
  };

  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');
  const [weeklySummaryNotReq, setweeklySummaryNotReq] = useState(
    displayUserProfile?.weeklySummaryOption === 'Not Required',
  );

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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.log('User Tasks not loaded.');
    }
  };

  // Get infringement count from userProfile
  const getInfringements = () => {
    return displayUserProfile && displayUserProfile.infringements
      ? displayUserProfile.infringements.length
      : 0;
  };

  // Get badges count from userProfile
  const getBadges = () => {
    if (!displayUserProfile || !displayUserProfile.badgeCollection) {
      return 0;
    }
    let totalBadges = 0;
    displayUserProfile.badgeCollection.forEach(badge => {
      if (badge?.badge?.badgeName === 'Personal Max' || badge?.badge?.type === 'Personal Max') {
        totalBadges += 1;
      } else {
        const badgeCount = badge?.count ? Number(badge.count) : 0;
        totalBadges += Math.round(badgeCount);
      }
    });

    return totalBadges;
  };

  // refactored for rading form values
  const readFormData = formid => {
    const form = document.getElementById(formid);
    const formData = new FormData(form);
    const data = {};
    let isvalid = true;
    formData.forEach((value, key) => {
      if (value.trim() !== '') {
        data[key] = value;
      } else {
        isvalid = false;
      }
    });

    if (data && data.action && data.action === 'edit') {
      const updatedSuggestionCategory = Array.from(sortableContainerRef.current.children).map(
        child => {
          return child.textContent;
        },
      );

      updatedSuggestionCategory.forEach(value => {
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
    data.firstName = displayUserProfile.firstName;
    data.lastName = displayUserProfile.lastName;
    data.email = displayUserProfile.email;
    httpService
      .post(`${ApiEndpoint}/dashboard/bugreport/${displayUserProfile._id}`, data)
      .catch(() => {});
    openReport();
  };

  const setnewfields = (fielddata, setfield) => {
    if (fielddata?.action === 'edit' && fielddata?.updatedSuggestionCategory) {
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
  // add new text field or suggestion category by owner class and update the backend
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
        .catch(() => {});
    } else {
      toast.error('Please fill all fields with valid values.');
    }
  };

  const sendUserSuggestion = async event => {
    event.preventDefault();
    const data = readFormData('suggestionForm');
    data.firstName = displayUserProfile.firstName;
    data.lastName = displayUserProfile.lastName;
    data.email = displayUserProfile.email;
    if (data) {
      setShowSuggestionModal(prev => !prev);
      const res = await httpService
        .post(`${ApiEndpoint}/dashboard/makesuggestion/${displayUserProfile._id}`, data)
        .catch(() => {});
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
        const res = await httpService.get(
          `${ApiEndpoint}/dashboard/suggestionoption/${displayUserProfile._id}`,
        );
        if (res && res.status === 200) {
          setSuggestionCategory(res.data.suggestion);
          setInputField(res.data.field);
        } else {
          // eslint-disable-next-line no-console
          console.error(res.status);
          // Handle the error as needed
        }
      } catch (error) {
        // eslint-disable-next-line no-console
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

  const canEditData = () =>
    !(displayUserProfile.role === 'Owner' && authUser.role !== 'Owner') &&
    canPutUserProfileImportantInfo;

  useEffect(() => {
    setUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    // Fetch user profile only if the selected timelog is of different user
    if (!isAuthUser) {
      loadUserProfile();
      getUserTasks();
    } else {
      setUserProfile(authUser);
      setTasks(displayUserTask.length);
    }
  }, [isAuthUser]);

  useEffect(() => {
    if (summaryBarData && displayUserProfile !== undefined) {
      setInfringements(getInfringements());
      setBadges(getBadges());
      setTotalEffort(summaryBarData.tangibletime);
      setWeeklySummary(getWeeklySummary(displayUserProfile));
      setweeklySummaryNotReq(displayUserProfile?.weeklySummaryOption === 'Not Required');
    }
  }, [displayUserProfile, summaryBarData]);

  const getContainerClass = () => {
    if (isAuthUser || canEditData()) {
      return darkMode
        ? 'bg-space-cadet text-light box-shadow-dark'
        : 'bg--bar text--black box-shadow-light';
    }
    return darkMode
      ? 'bg-space-cadet disabled-bar text-light box-shadow-dark'
      : 'bg--bar disabled-bar text--black box-shadow-light';
  };

  const renderSummary = () => {
    if (!weeklySummary) {
      if (weeklySummaryNotReq) {
        return (
          <div
            className="border-black col-4 bg-super-awesome no-gutters d-flex justify-content-center align-items-center"
            align="center"
          >
            <font className="text-center text-light" size="3">
              SUMMARY
            </font>
          </div>
        );
      }
      return (
        <div
          className={`border border-danger col-4 no-gutters ${
            darkMode ? 'bg-yinmn-blue' : 'bg-white'
          }`}
        >
          <div className="py-1"> </div>
          {isAuthUser || canEditData() ? (
            <div className="d-flex justify-content-center">
              <button
                onClick={props.toggleSubmitForm}
                className="summary-toggle large_text_summary text-danger"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                aria-label="Toggle submit form"
                type="button"
              >
                !
              </button>
            </div>
          ) : (
            <p className="text-center summary-toggle large_text_summary text-danger">!</p>
          )}
          <font className="text-center" size="3">
            SUMMARY
          </font>
          <div className="py-2"> </div>
        </div>
      );
    }
    return (
      <div className="border-green col-4 bg--dark-green">
        <div className="py-1"> </div>
        <div className="d-flex justify-content-center">
          <button
            onClick={props.toggleSubmitForm}
            className="text-center large_text_summary summary-toggle"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            aria-label="Toggle submit form"
            type="button"
          >
            ✓
          </button>
        </div>
        <font className="text-center" size="3">
          SUMMARY
        </font>
        <div className="py-2"> </div>
      </div>
    );
  };

  const renderSummaryMessage = () => {
    if (weeklySummary || props.submittedSummary) {
      return 'You have submitted your weekly summary.';
    }

    const message = weeklySummaryNotReq
      ? 'You don’t need to complete a weekly summary, but you still can. Click here to submit it.'
      : 'You still need to complete the weekly summary. Click here to submit it.';

    if (isAuthUser) {
      return (
        <button
          className="summary-toggle"
          type="button"
          onClick={props.toggleSubmitForm}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            cursor: 'pointer',
          }}
          aria-label="Toggle submit form"
        >
          {message}
        </button>
      );
    }

    return <span className="summary-toggle">{message}</span>;
  };

  const getPlaceholderText = () => {
    if (extraFieldForSuggestionForm === 'suggestion') {
      return editType === 'delete'
        ? 'write the category number, like 1 or 2 etc'
        : 'write the category name';
    }
    return 'write the field name';
  };

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  return displayUserProfile !== undefined && summaryBarData !== undefined ? (
    <Container fluid className={`px-lg-0 rounded ${getContainerClass()}`} style={{ width: '97%' }}>
      <Row className="no-gutters row-eq-height">
        <Col
          className="d-flex justify-content-center align-items-center col-lg-2 col-12 text-list"
          align="center"
        >
          <div>
            <font className="align-middle" size="3">
              {' '}
              Activity for{' '}
            </font>
            <CardTitle className={`align-middle ${darkMode ? 'text-light' : 'text-dark'}`} tag="h3">
              <div className="font-weight-bold">
                {userProfile?.firstName || displayUserProfile.firstName}{' '}
                {userProfile?.lastName || displayUserProfile.lastName}
              </div>
            </CardTitle>
          </div>
        </Col>
        <Col className="d-flex col-lg-3 col-12 no-gutters">
          <Row className="no-gutters w-100">
            {totalEffort < weeklyCommittedHours && (
              <div
                className={`border border-danger col-4 ${darkMode ? 'bg-yinmn-blue' : 'bg-white'}`}
              >
                <div className="py-1"> </div>
                <p className="text-center large_text_summary text-danger">!</p>
                <font className="text-center" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}
            {totalEffort >= weeklyCommittedHours && (
              <div className="border-green col-4 bg--dark-green">
                <div className="py-1"> </div>
                <p className="text-center large_text_summary">✓</p>
                <font className="text-center" size="3">
                  HOURS
                </font>
                <div className="py-2"> </div>
              </div>
            )}

            <div
              className={`col-8 d-flex justify-content-center align-items-center ${
                darkMode ? 'bg-yinmn-blue' : 'bg-white'
              }`}
              style={{ border: '1px solid black' }}
            >
              <div className="align-items-center" id="timelogweeklychart">
                <div className="align-items-center med_text_summary">
                  Current Week : {totalEffort.toFixed(2)} / {weeklyCommittedHours.toFixed(2)}
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
            {renderSummary()}
            <div
              className={`col-8 d-flex align-items-center ${
                darkMode ? 'bg-yinmn-blue' : 'bg-white'
              }`}
              style={{ border: '1px solid black' }}
            >
              <div className="m-auto p-2 text-center">
                <font
                  onClick={props.toggleSubmitForm}
                  className="med_text_summary align-middle summary-toggle"
                  size="3"
                >
                  {renderSummaryMessage()}
                </font>
              </div>
            </div>
          </Row>
        </Col>

        <Col
          className={`m-auto mt-2 col-lg-4 col-12 badge-list ${darkMode ? 'bg-space-cadet' : ''}`}
        >
          <div className="d-flex justify-content-around no-gutters">
            &nbsp;&nbsp;
            <div className="image_frame">
              <div className="redBackgroup">
                <span>{tasks}</span>
              </div>
              {isAuthUser || canEditData() ? (
                <button
                  onClick={onTaskClick}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Task"
                  type="button"
                >
                  <img className="sum_img" src={TaskIcon} alt="" />
                </button>
              ) : (
                <img className="sum_img" src={TaskIcon} alt="" />
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              <div className="redBackgroup">
                <span>{badges}</span>
              </div>
              {isAuthUser || canEditData() ? (
                <button
                  onClick={onBadgeClick}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Badge"
                  type="button"
                >
                  <img className="sum_img" src={BadgesIcon} alt="" />
                </button>
              ) : (
                <img className="sum_img" src={BadgesIcon} alt="" />
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              {isAuthUser || canEditData() ? (
                <Link to={`/userprofile/${displayUserProfile._id}#bluesquare`}>
                  <img className="sum_img" src={BlueScoreIcon} alt="" />
                  <div className="redBackgroup">
                    <span>{infringements}</span>
                  </div>
                </Link>
              ) : (
                <div>
                  <img className="sum_img" src={BlueScoreIcon} alt="" />
                  <div className="redBackgroup">
                    <span>{infringements}</span>
                  </div>
                </div>
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              {isAuthUser || canEditData() ? (
                <button
                  onClick={openReport}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Open Report"
                  type="button"
                >
                  <img className="sum_img" src={ReportIcon} alt="" />
                </button>
              ) : (
                <img className="sum_img" src={ReportIcon} alt="" />
              )}
            </div>
            &nbsp;&nbsp;
            <div className="image_frame">
              {isAuthUser || canEditData() ? (
                <button
                  onClick={openSuggestionModal}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="Open Suggestions"
                  type="button"
                >
                  <img className="sum_img" src={SuggestionsIcon} alt="" />
                </button>
              ) : (
                <img className="sum_img" src={SuggestionsIcon} alt="" />
              )}
            </div>
          </div>
        </Col>
        <Modal
          isOpen={showSuggestionModal}
          onClosed={() => closeSuggestionModal()}
          toggle={openSuggestionModal}
          className={darkMode ? 'text-light' : ''}
        >
          <ModalHeader className={headerBg}>User Suggestion</ModalHeader>
          <ModalBody className={bodyBg}>
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
                    <Label check className={fontColor}>
                      <Input
                        onChange={e => editRadioButtonSelected(e.target.value)}
                        type="radio"
                        name="action"
                        value="add"
                        required
                      />{' '}
                      Add
                    </Label>
                  </FormGroup>
                  {extraFieldForSuggestionForm === 'suggestion' && (
                    <FormGroup check>
                      <Label check className={fontColor}>
                        <Input
                          onChange={e => editRadioButtonSelected(e.target.value)}
                          type="radio"
                          name="action"
                          value="edit"
                          required
                        />{' '}
                        Edit
                      </Label>
                    </FormGroup>
                  )}
                  <FormGroup check>
                    <Label check className={fontColor}>
                      <Input
                        onChange={e => editRadioButtonSelected(e.target.value)}
                        type="radio"
                        name="action"
                        value="delete"
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
                    <Label for="newField" className={fontColor}>
                      {extraFieldForSuggestionForm === 'suggestion' && categoryDescription}
                    </Label>
                    {editType !== 'edit' && (
                      <Input
                        type="textarea"
                        name="newField"
                        id="newField"
                        placeholder={getPlaceholderText()}
                        required
                      />
                    )}
                    {editType === 'edit' && (
                      <div
                        className="sortable-container"
                        ref={sortableContainerRef}
                        onDragOver={e => onSortableDragOver(e)}
                      >
                        {suggestionCategory.map(item => (
                          <div
                            className={`sortable-content ${bodyBg} sortable-draggable`}
                            key={item.id}
                            draggable="true"
                            onDragStart={event => onDragToggleDraggingClass(event)}
                            onDragEnd={event => onDragToggleDraggingClass(event)}
                          >
                            <p>{item.value}</p>
                            <button
                              type="button"
                              className="edit-icon fa fa-edit"
                              onClick={event => handleEditClick(event)}
                              aria-label="Edit item"
                            />
                          </div>
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
                <Label for="suggestioncate" className={fontColor}>
                  Please select a category of your suggestion:
                </Label>

                <Input
                  onChange={() => setTakeInput(true)}
                  type="select"
                  name="suggestioncate"
                  id="suggestioncate"
                  defaultValue=""
                  required
                >
                  <option disabled value="" hidden>
                    {' '}
                    -- select an option --{' '}
                  </option>
                  {suggestionCategory.map(item => {
                    return <option key={item.id} value={item}>{`${item.id + 1}. ${item}`}</option>;
                  })}
                </Input>
              </FormGroup>
              {takeInput && (
                <FormGroup>
                  <Label for="suggestion" className={fontColor}>
                    {' '}
                    Write your suggestion:{' '}
                  </Label>
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
                inputFiled.map(item => (
                  <FormGroup key={item.id}>
                    <Label for="title" className={fontColor}>
                      {item}{' '}
                    </Label>
                    <Input type="textbox" name={item} id={item.id} placeholder="" required />
                  </FormGroup>
                ))}
              <FormGroup tag="fieldset" id="fieldset">
                <legend style={{ fontSize: '16px' }}>
                  Would you like a followup/reply regarding this feedback?
                </legend>
                <FormGroup check>
                  <Label check className={fontColor}>
                    <Input type="radio" name="confirm" value="yes" required /> Yes
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check className={fontColor}>
                    <Input type="radio" name="confirm" value="no" required /> No
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

        <Modal isOpen={report.in} toggle={openReport} className={fontColor}>
          <ModalHeader className={headerBg}>Bug Report</ModalHeader>
          <ModalBody className={bodyBg}>
            <Form onSubmit={sendBugReport} id="bugReportForm">
              <FormGroup>
                <Label for="title" className={fontColor}>
                  [Feature Name] Bug Title{' '}
                </Label>
                <Input
                  type="textbox"
                  name="title"
                  id="title"
                  required
                  placeholder="Provide Concise Sumary Title..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="environment" className={fontColor}>
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
                <Label for="reproduction" className={fontColor}>
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
                <Label for="expected" className={fontColor}>
                  Expected Result (Short Sweet to the point){' '}
                </Label>
                <Input
                  type="textarea"
                  name="expected"
                  id="expected"
                  required
                  placeholder="What did you expect to happen?..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="actual" className={fontColor}>
                  Actual Result (Short Sweet to the point){' '}
                </Label>
                <Input
                  type="textarea"
                  name="actual"
                  id="actual"
                  required
                  placeholder="What actually happened?.."
                />
              </FormGroup>
              <FormGroup>
                <Label for="visual" className={fontColor}>
                  Visual Proof (screenshots, videos, text){' '}
                </Label>
                <Input
                  type="textarea"
                  name="visual"
                  id="visual"
                  required
                  placeholder="Links to screenshots etc..."
                />
              </FormGroup>
              <FormGroup>
                <Label for="severity" className={fontColor}>
                  Severity/Priority (How Bad is the Bug?){' '}
                </Label>
                <Input type="select" name="severity" id="severity" defaultValue="" required>
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
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
  displayUserTask: state.userTask,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, { hasPermission })(SummaryBar);

import { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import './WeeklySummary.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';
import 'moment-timezone';
import Joi from 'joi';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import { getUserProfile } from 'actions/userProfile';
import { boxStyle } from 'styles';
import { WeeklySummaryContentTooltip, MediaURLTooltip } from './WeeklySummaryTooltips';
import SkeletonLoading from '../common/SkeletonLoading';
import DueDateTime from './DueDateTime';
import {
  getWeeklySummaries as getUserWeeklySummaries,
  updateWeeklySummaries,
} from '../../actions/weeklySummaries';
import CurrentPromptModal from './CurrentPromptModal';

// Need this export here in order for automated testing to work.
export class WeeklySummary extends Component {
  // eslint-disable-next-line react/state-in-constructor
  state = {
    summariesCountShowing: 0,
    originSummaries: {
      summary: '',
      summaryLastWeek: '',
      summaryBeforeLast: '',
      summaryThreeWeeksAgo: '',
    },
    formElements: {
      summary: '',
      wordCount: 0,
      summaryLastWeek: '',
      summaryBeforeLast: '',
      summaryThreeWeeksAgo: '',
      mediaUrl: '',
      weeklySummariesCount: 0,
      mediaConfirm: false,
      editorConfirm: false,
      proofreadConfirm: false,
    },
    dueDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .toISOString(),
    dueDateLastWeek: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(1, 'week')
      .toISOString(),
    dueDateBeforeLast: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(2, 'week')
      .toISOString(),
    dueDateThreeWeeksAgo: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(3, 'week')
      .toISOString(),
    uploadDatesElements: {
      uploadDate: this.dueDate,
      uploadDateLastWeek: this.dueDateLastWeek,
      uploadDateBeforeLast: this.dueDateBeforeLast,
      uploadDateThreeWeeksAgo: this.dueDateThreeWeeksAgo,
    },
    submittedDate: moment()
      .tz('America/Los_Angeles')
      .toISOString(),
    submittedCountInFourWeeks: 0,
    activeTab: '1',
    errors: {},
    fetchError: null,
    loading: true,
    editPopup: false,
    mediaChangeConfirm: false,
    mediaFirstChange: false,
    moveSelect: '-1',
    movePopup: false,
    moveConfirm: false,
  };

  // Minimum word count of 50 (handle words that also use non-ASCII characters by counting whitespace rather than word character sequences).
  regexPattern = /^\s*(?:\S+(?:\s+|$)){50,}$/;

  // regexPattern = /^(?=(?:\S*\s){50,})\S*$/;

  schema = {
    mediaUrl: Joi.string()
      .trim()
      .uri()
      .required()
      .label('Media URL'),
    summary: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'), // Allow empty string OR the minimum word count of 50.
    wordCount: Joi.number()
      .min(50)
      .label('word count must be greater than 50 words'),
    summaryLastWeek: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    summaryBeforeLast: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    summaryThreeWeeksAgo: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    weeklySummariesCount: Joi.optional(),
    mediaConfirm: Joi.boolean()
      .invalid(false)
      .label('Media Confirm'),
    editorConfirm: Joi.boolean()
      .invalid(false)
      .label('Editor Confirm'),
    proofreadConfirm: Joi.boolean()
      .invalid(false)
      .label('Proofread Confirm'),
  };

  async componentDidMount() {
    const { dueDate: _dueDate } = this.state;
    // eslint-disable-next-line no-shadow
    const {
      getWeeklySummaries,
      displayUserId,
      currentUser,
      summaries,
      fetchError,
      loading,
    } = this.props;

    await getWeeklySummaries(displayUserId || currentUser.userid);

    const { mediaUrl, weeklySummaries, weeklySummariesCount } = summaries;

    const summary = (weeklySummaries && weeklySummaries[0] && weeklySummaries[0].summary) || '';
    const summaryLastWeek =
      (weeklySummaries && weeklySummaries[1] && weeklySummaries[1].summary) || '';
    const summaryBeforeLast =
      (weeklySummaries && weeklySummaries[2] && weeklySummaries[2].summary) || '';
    const summaryThreeWeeksAgo =
      (weeklySummaries && weeklySummaries[3] && weeklySummaries[3].summary) || '';

    // Before submitting summaries, count current submits in four weeks
    let submittedCountInFourWeeks = 0;
    if (summary !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryLastWeek !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryBeforeLast !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryThreeWeeksAgo !== '') {
      submittedCountInFourWeeks += 1;
    }

    const dueDateThisWeek = weeklySummaries && weeklySummaries[0] && weeklySummaries[0].dueDate;
    // Make sure server dueDate is not before the localtime dueDate.
    const dueDate = moment(dueDateThisWeek).isBefore(_dueDate) ? _dueDate : dueDateThisWeek;

    // Calculate due dates for the last three weeks by subtracting 1, 2, and 3 weeks from the current due date
    // and then setting the due date to the end of the ISO week (Saturday) for each respective week
    const dueDateLastWeek = moment(dueDate)
      .subtract(1, 'weeks')
      .toISOString();

    const dueDateBeforeLast = moment(dueDate)
      .subtract(2, 'weeks')
      .toISOString();
    const dueDateThreeWeeksAgo = moment(dueDate)
      .subtract(3, 'weeks')
      .toISOString();

    const uploadDateXWeeksAgo = x => {
      const summaryList = [summary, summaryLastWeek, summaryBeforeLast, summaryThreeWeeksAgo];
      const dueDateList = [dueDate, dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo];
      return summaryList[x] !== '' &&
        weeklySummaries &&
        weeklySummaries[x] &&
        weeklySummaries[x].uploadDate
        ? weeklySummaries[x].uploadDate
        : dueDateList[x];
    };
    const uploadDate = uploadDateXWeeksAgo(0);
    const uploadDateLastWeek = uploadDateXWeeksAgo(1);
    const uploadDateBeforeLast = uploadDateXWeeksAgo(2);
    const uploadDateThreeWeeksAgo = uploadDateXWeeksAgo(3);

    this.setState({
      originSummaries: {
        summary,
        summaryLastWeek,
        summaryBeforeLast,
        summaryThreeWeeksAgo,
      },
      formElements: {
        summary,
        summaryLastWeek,
        summaryBeforeLast,
        summaryThreeWeeksAgo,
        // wordCount: 0,
        mediaUrl: mediaUrl || '',
        weeklySummariesCount: weeklySummariesCount || 0,
        mediaConfirm: false,
        editorConfirm: false,
        proofreadConfirm: false,
      },
      uploadDatesElements: {
        uploadDate,
        uploadDateLastWeek,
        uploadDateBeforeLast,
        uploadDateThreeWeeksAgo,
      },
      dueDate,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
      submittedCountInFourWeeks,
      activeTab: '1',
      fetchError,
      loading,
      editPopup: false,
      mediaChangeConfirm: false,
      mediaFirstChange: false,
    });

    // console.log('this.props.userRole in WeeklySummary: ', this.props.userRole);
  }

  doesDateBelongToWeek = (dueDate, weekIndex) => {
    const pstStartOfWeek = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week');
    const pstEndOfWeek = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week');
    const fromDate = moment(pstStartOfWeek).toDate();
    const toDate = moment(pstEndOfWeek).toDate();
    return moment(dueDate).isBetween(fromDate, toDate, undefined, '[]');
  };

  toggleTab = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  };

  toggleMovePopup = showPopup => {
    this.setState({ movePopup: !showPopup });
  };

  toggleShowPopup = showPopup => {
    const { mediaChangeConfirm } = this.state;
    if (!mediaChangeConfirm) {
      this.setState({ editPopup: !showPopup });
    } else {
      this.setState({ editPopup: false });
    }
  };

  handleMoveSelect = moveWeek => {
    this.setState({ moveSelect: moveWeek, movePopup: true });
  };

  handleMove = () => {
    const { isNotAllowedToEdit } = this.props;
    if (isNotAllowedToEdit) {
      // eslint-disable-next-line no-alert
      alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
      return;
    }
    const { moveSelect, formElements, activeTab, movePopup } = this.state;
    const newformElements = { ...formElements };

    if (activeTab !== moveSelect) {
      let movedContent = '';
      switch (activeTab) {
        case '1':
          movedContent = newformElements.summary;
          newformElements.summary = '';
          break;
        case '2':
          movedContent = newformElements.summaryLastWeek;
          newformElements.summaryLastWeek = '';
          break;
        case '3':
          movedContent = newformElements.summaryBeforeLast;
          newformElements.summaryBeforeLast = '';
          break;
        case '4':
          movedContent = newformElements.summaryThreeWeeksAgo;
          newformElements.summaryThreeWeeksAgo = '';
          break;
        default:
          break;
      }
      switch (moveSelect) {
        case '1':
          newformElements.summary = movedContent;
          break;
        case '2':
          newformElements.summaryLastWeek = movedContent;
          break;
        case '3':
          newformElements.summaryBeforeLast = movedContent;
          break;
        case '4':
          newformElements.summaryThreeWeeksAgo = movedContent;
          break;
        default:
          break;
      }
    }
    // confitm move or not
    this.toggleMovePopup(movePopup);
    // eslint-disable-next-line consistent-return
    return newformElements;
  };

  validate = () => {
    const options = { abortEarly: false };
    const { formElements } = this.state;
    const result = Joi.validate(formElements, this.schema, options);
    return result?.error?.details.reduce((pre, cur) => {
      // eslint-disable-next-line no-param-reassign
      pre[cur.path[0]] = cur.message;
      return pre;
    }, {});
  };

  validateProperty = ({ name, value, type, checked }) => {
    const attr = type === 'checkbox' ? checked : value;
    const obj = { [name]: attr };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  validateEditorProperty = (content, name) => {
    const obj = { [name]: content };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleInputChange = event => {
    const {
      formElements: _formElements,
      mediaChangeConfirm,
      errors: _errors,
      editPopup,
    } = this.state;

    event.persist();
    const { name, value } = event.target;
    const formElements = { ..._formElements };
    if (mediaChangeConfirm) {
      const errors = { ..._errors };

      const errorMessage = this.validateProperty(event.target);
      if (errorMessage) errors[name] = errorMessage;
      else delete errors[name];
      formElements[name] = value;
      this.setState({ formElements, errors });
    } else {
      this.toggleShowPopup(editPopup);
    }
  };

  handleMediaChange = () => {
    const { editPopup } = this.state;
    this.setState({
      mediaChangeConfirm: true,
      mediaFirstChange: true,
    });

    this.toggleShowPopup(editPopup);
  };

  handleEditorChange = (content, editor) => {
    const { errors: _errors, formElements: _formElements } = this.state;
    // Filter out blank pagagraphs inserted by tinymce replacing new line characters. Need those removed so Joi could do word count checks properly.
    const filteredContent = content.replace(/<p>&nbsp;<\/p>/g, '');

    const wordCount = editor.plugins.wordcount.getCount();

    const errors = { ..._errors };
    const errorMessage = this.validateEditorProperty(filteredContent, editor.id);
    const errorWordCountMessage = this.validateEditorProperty(wordCount, 'wordCount');

    if (errorMessage) errors[editor.id] = errorMessage;
    else delete errors[editor.id];

    if (errorWordCountMessage) errors.wordCount = errorWordCountMessage;
    else delete errors.wordCount;

    const formElements = { ..._formElements, wordCount };

    formElements[editor.id] = content;
    this.setState({ formElements, errors });
  };

  handleCheckboxChange = event => {
    const { errors: _errors, formElements: _formElements } = this.state;
    event.persist();
    const { name, checked } = event.target;
    const errors = { ..._errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ..._formElements };
    formElements[name] = checked;
    this.setState({ formElements, errors });
  };

  handleChangeInSummary = async () => {
    // Extract state variables for ease of access
    const {
      submittedDate,
      formElements,
      uploadDatesElements,
      originSummaries,
      dueDate,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
      submittedCountInFourWeeks,
      moveConfirm,
    } = this.state;
    let newformElements = { ...formElements };
    const newOriginSummaries = { ...originSummaries };
    const newUploadDatesElements = { ...uploadDatesElements };
    const dueDates = [dueDate, dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo];
    // Move or not, if did move, update the newformElements
    if (moveConfirm) {
      newformElements = this.handleMove();
    }
    // Define summaries, updateDates for easier reference
    const summaries = ['summary', 'summaryLastWeek', 'summaryBeforeLast', 'summaryThreeWeeksAgo'];
    const uploadDates = [
      'uploadDate',
      'uploadDateLastWeek',
      'uploadDateBeforeLast',
      'uploadDateThreeWeeksAgo',
    ];
    // Calculate currentSubmittedCount using reduce
    const currentSubmittedCount = summaries.reduce((count, summary) => {
      return newformElements[summary] !== '' ? count + 1 : count;
    }, 0);
    const diffInSubmittedCount = currentSubmittedCount - submittedCountInFourWeeks;
    if (diffInSubmittedCount !== 0) {
      this.setState({ summariesCountShowing: newformElements.weeklySummariesCount + 1 });
    }
    // eslint-disable-next-line no-shadow
    const updateSummary = (summary, uploadDate, dueDate) => {
      if (newformElements[summary] !== newOriginSummaries[summary]) {
        newOriginSummaries[summary] = newformElements[summary];
        newUploadDatesElements[uploadDate] =
          newformElements[summary] === '' ? dueDate : submittedDate;
        this.setState({
          formElements: newformElements,
          uploadDatesElements: newUploadDatesElements,
          originSummaries: newOriginSummaries,
        });
      }
    };
    // Loop through summaries and update state variables
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < summaries.length; i++) {
      updateSummary(summaries[i], uploadDates[i], dueDates[i]);
    }

    // eslint-disable-next-line no-shadow
    const { updateWeeklySummaries, displayUserId, currentUser } = this.props;

    // Construct the modified weekly summaries
    const modifiedWeeklySummaries = {
      mediaUrl: newformElements.mediaUrl.trim(),
      weeklySummaries: summaries.map((summary, i) => ({
        summary: newformElements[summary],
        dueDate: dueDates[i],
        uploadDate: newUploadDatesElements[uploadDates[i]],
      })),
      weeklySummariesCount: newformElements.weeklySummariesCount + diffInSubmittedCount,
    };

    // Update weekly summaries
    return updateWeeklySummaries(displayUserId || currentUser.userid, modifiedWeeklySummaries);
  };

  // Updates user profile and weekly summaries
  updateUserData = async userId => {
    // eslint-disable-next-line no-shadow
    const { getUserProfile, getWeeklySummaries } = this.props;
    await getUserProfile(userId);
    await getWeeklySummaries(userId);
  };

  // Handler for success scenario after save
  handleSaveSuccess = async toastIdOnSave => {
    const { displayUserId, currentUser } = this.props;
    toast.success('✔ The data was saved successfully!', {
      toastId: toastIdOnSave,
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
    await this.updateUserData(displayUserId || currentUser.userid);
  };

  // Handler for error scenario after save
  handleSaveError = toastIdOnSave => {
    toast.error('✘ The data could not be saved!', {
      toastId: toastIdOnSave,
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  };

  // Main save handler, used by both handleMoveSave and handleSave
  mainSaveHandler = async closeAfterSave => {
    const toastIdOnSave = 'toast-on-save';
    const errors = this.validate();

    this.setState({ errors: errors || {} });
    if (errors) this.state.moveConfirm = false;
    if (errors) return;

    const result = await this.handleChangeInSummary();

    if (result === 200) {
      await this.handleSaveSuccess(toastIdOnSave);
      if (closeAfterSave) {
        this.handleClose();
      }
    } else {
      this.handleSaveError(toastIdOnSave);
    }
  };

  handleMoveSave = async event => {
    const { isNotAllowedToEdit } = this.props;
    if (isNotAllowedToEdit) {
      // eslint-disable-next-line no-alert
      alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
      return;
    }
    if (event) {
      event.preventDefault();
    }
    const { moveConfirm, moveSelect } = this.state;
    this.state.moveConfirm = true;
    this.mainSaveHandler(false);
    if (moveConfirm) {
      this.toggleTab(moveSelect);
    }
  };

  handleSave = async event => {
    const { isNotAllowedToEdit } = this.props;
    if (isNotAllowedToEdit) {
      // eslint-disable-next-line no-alert
      alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
      return;
    }
    if (event) {
      event.preventDefault();
    }
    this.mainSaveHandler(true);
  };

  handleClose = () => {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.setPopup(false);
  };

  render() {
    const {
      formElements,
      dueDate,
      activeTab,
      errors,
      loading,
      fetchError,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
      summariesCountShowing,
      mediaFirstChange,
      editPopup,
      movePopup,
    } = this.state;
    const { isDashboard, isPopup, isModal, isNotAllowedToEdit } = this.props;

    // Create an object containing labels for each summary tab:
    // - 'This Week' for the current week's tab
    // - 'Last Week' or the specific date for the last week's tab, depending on whether it belongs to the same week as the due date
    // - 'Week Before Last' or the specific date for the week before the last week's tab, depending on whether it belongs to the same week as the due date
    // - 'Three Weeks Ago' or the specific date for the tab three weeks ago, depending on whether it belongs to the same week as the due date
    const summariesLabels = {
      summary: 'This Week',
      summaryLastWeek: this.doesDateBelongToWeek(dueDateLastWeek, 1)
        ? 'Last Week'
        : moment(dueDateLastWeek).format('YYYY-MMM-DD'),
      summaryBeforeLast: this.doesDateBelongToWeek(dueDateBeforeLast, 2)
        ? 'Week Before Last'
        : moment(dueDateBeforeLast).format('YYYY-MMM-DD'),
      summaryThreeWeeksAgo: this.doesDateBelongToWeek(dueDateThreeWeeksAgo, 3)
        ? 'Three Weeks Ago'
        : moment(dueDateThreeWeeksAgo).format('YYYY-MMM-DD'),
    };

    if (fetchError) {
      return (
        <Container>
          <Row className="align-self-center" data-testid="error">
            <Col>
              <Alert color="danger">
                Fetch error!
                {fetchError.message}
              </Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    if (loading) {
      return (
        <Container fluid>
          <Row className="text-center" data-testid="loading">
            <SkeletonLoading template="WeeklySummary" />
          </Row>
        </Container>
      );
    }

    if (isDashboard) {
      return <DueDateTime isShow={isPopup} dueDate={moment(dueDate)} />;
    }

    const { userRole, displayUserId } = this.props;

    return (
      <Container fluid={!!isModal} className="bg--white-smoke py-3 mb-5">
        <h3>Weekly Summaries</h3>
        {/* Before clicking Save button, summariesCountShowing is 0 */}
        <Row>
          <Col md="9">
            Total submitted:
            {summariesCountShowing || formElements.weeklySummariesCount}
          </Col>
          <Col md="3">
            <Button className="btn--dark-sea-green" onClick={this.handleClose} style={boxStyle}>
              Close this window
            </Button>
          </Col>
        </Row>
        <Form>
          <Nav tabs>
            {Object.values(summariesLabels).map((weekName, i) => {
              const tId = String(i + 1);
              return (
                <NavItem key={tId}>
                  <NavLink
                    className={classnames({ active: activeTab === tId })}
                    data-testid={`tab-${tId}`}
                    onClick={() => {
                      this.toggleTab(tId);
                    }}
                  >
                    {weekName}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
          <TabContent activeTab={activeTab} className="p-2 weeklysummarypane">
            {Object.keys(summariesLabels).map((summaryName, i) => {
              const tId = String(i + 1);
              return (
                <TabPane tabId={tId} key={tId}>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for={summaryName} className="summary-instructions-row">
                          <div>
                            Enter your weekly summary below. (required)
                            <WeeklySummaryContentTooltip tabId={tId} />
                          </div>
                          {isNotAllowedToEdit && isNotAllowedToEdit === true ? null : (
                            <UncontrolledDropdown>
                              <DropdownToggle
                                className="px-5 btn--dark-sea-green"
                                caret
                                style={boxStyle}
                              >
                                Move This Summary
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem
                                  disabled={activeTab === '1'}
                                  onClick={() => this.handleMoveSelect('1')}
                                >
                                  This Week
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '2'}
                                  onClick={() => this.handleMoveSelect('2')}
                                >
                                  Last Week
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '3'}
                                  onClick={() => this.handleMoveSelect('3')}
                                >
                                  Week Before Last
                                </DropdownItem>
                                <DropdownItem
                                  disabled={activeTab === '4'}
                                  onClick={() => this.handleMoveSelect('4')}
                                >
                                  Three Weeks Ago
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          )}
                          <CurrentPromptModal userRole={userRole} userId={displayUserId} />
                        </Label>
                        <Editor
                          init={{
                            menubar: false,
                            placeholder: `Did you: Write it in 3rd person with a minimum of 50-words? Remember to run it through ChatGPT or other AI editor using the “Current AI Editing Prompt” from above? Remember to read and do a final edit before hitting Save?`,
                            plugins:
                              'advlist autolink autoresize lists link charmap table paste help wordcount',
                            toolbar:
                              'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
                            branding: false,
                            min_height: 180,
                            max_height: 500,
                            autoresize_bottom_margin: 1,
                          }}
                          id={summaryName}
                          name={summaryName}
                          value={formElements[summaryName]}
                          onEditorChange={this.handleEditorChange}
                        />
                      </FormGroup>
                      {(errors.summary ||
                        errors.summaryLastWeek ||
                        errors.summaryBeforeLast ||
                        errors.summaryThreeWeeksAgo ||
                        errors.wordCount) && (
                        <Alert color="danger">
                          The summary must contain a minimum of 50 words.
                        </Alert>
                      )}
                    </Col>
                  </Row>
                </TabPane>
              );
            })}
            <Row>
              <Col>
                {formElements.mediaUrl && !mediaFirstChange ? (
                  <FormGroup className="media-url">
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                    <Label for="mediaUrl" className="mt-1">
                      <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">
                        Your DropBox Media Files Link (Share your files here)
                      </a>
                      <MediaURLTooltip />
                    </Label>
                  </FormGroup>
                ) : (
                  <Col>
                    <Label for="mediaUrl" className="mt-1">
                      Dropbox link to your weekly media files. (required)
                      <MediaURLTooltip />
                    </Label>
                    <Row form>
                      <Col md={8}>
                        <FormGroup>
                          <Input
                            type="url"
                            name="mediaUrl"
                            id="mediaUrl"
                            data-testid="media-input"
                            placeholder="Enter a link"
                            value={formElements.mediaUrl}
                            onChange={this.handleInputChange}
                          />
                        </FormGroup>
                        <Modal isOpen={editPopup}>
                          <ModalHeader> Warning!</ModalHeader>
                          <ModalBody>
                            Whoa Tiger! Are you sure you want to do that? This link needs to be
                            added by an Admin when you were set up as a member of the team. Only
                            Update this if you are SURE your new link is correct.
                          </ModalBody>
                          <ModalFooter>
                            <Button onClick={this.handleMediaChange} style={boxStyle}>
                              Confirm
                            </Button>
                            <Button
                              onClick={() => this.toggleShowPopup(editPopup)}
                              style={boxStyle}
                            >
                              Close
                            </Button>
                          </ModalFooter>
                        </Modal>
                        {errors.mediaUrl && <Alert color="danger">{errors.mediaUrl}</Alert>}
                      </Col>
                      {formElements.mediaUrl && !errors.mediaUrl && (
                        <Col md={4}>
                          <FormGroup className="media-url">
                            <FontAwesomeIcon
                              icon={faExternalLinkAlt}
                              className="mx-1 text--silver"
                            />
                            <a
                              href={formElements.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open link
                            </a>
                          </FormGroup>
                        </Col>
                      )}
                    </Row>
                  </Col>
                )}

                <Row form>
                  <Modal isOpen={movePopup} toggle={this.toggleMovePopup}>
                    <ModalHeader> Warning!</ModalHeader>
                    <ModalBody>Are you SURE you want to move the summary?</ModalBody>
                    <ModalFooter>
                      <Button onClick={this.handleMoveSave} style={boxStyle}>
                        Confirm and Save
                      </Button>
                      <Button onClick={this.toggleMovePopup} style={boxStyle}>
                        Close
                      </Button>
                    </ModalFooter>
                  </Modal>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <CustomInput
                        id="mediaConfirm"
                        data-testid="mediaConfirm"
                        name="mediaConfirm"
                        type="checkbox"
                        label="I have provided a minimum of 4 screenshots (6-10 preferred) of this week's work. (required)"
                        htmlFor="mediaConfirm"
                        checked={formElements.mediaConfirm}
                        valid={formElements.mediaConfirm}
                        onChange={this.handleCheckboxChange}
                      />
                    </FormGroup>
                    {errors.mediaConfirm && (
                      <Alert color="danger">
                        Please confirm that you have provided the required media files.
                      </Alert>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <CustomInput
                        id="editorConfirm"
                        data-testid="editorConfirm"
                        name="editorConfirm"
                        type="checkbox"
                        label="I used GPT (or other AI editor) with the most current prompt."
                        htmlFor="editorConfirm"
                        checked={formElements.editorConfirm}
                        valid={formElements.editorConfirm}
                        onChange={this.handleCheckboxChange}
                      />
                    </FormGroup>
                    {errors.editorConfirm && (
                      <Alert color="danger">
                        Please confirm that you used an AI editor to write your summary.
                      </Alert>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <CustomInput
                        id="proofreadConfirm"
                        name="proofreadConfirm"
                        data-testid="proofreadConfirm"
                        type="checkbox"
                        label="I proofread my weekly summary."
                        htmlFor="proofreadConfirm"
                        checked={formElements.proofreadConfirm}
                        valid={formElements.proofreadConfirm}
                        onChange={this.handleCheckboxChange}
                      />
                    </FormGroup>
                    {errors.proofreadConfirm && (
                      <Alert color="danger">
                        Please confirm that you have proofread your summary.
                      </Alert>
                    )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col>
                    <FormGroup className="mt-2">
                      <Button
                        className="px-5 btn--dark-sea-green"
                        disabled={Boolean(this.validate())}
                        onClick={this.handleSave}
                        style={boxStyle}
                      >
                        Save
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </TabContent>
        </Form>
      </Container>
    );
  }
}

WeeklySummary.propTypes = {
  currentUser: PropTypes.shape({
    userid: PropTypes.string.isRequired,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types, react/require-default-props
  fetchError: PropTypes.any,
  getWeeklySummaries: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  summaries: PropTypes.object.isRequired,
  updateWeeklySummaries: PropTypes.func.isRequired,
};

const mapStateToProps = ({ auth, weeklySummaries }) => ({
  currentUser: auth.user,
  summaries: weeklySummaries?.summaries,
  loading: weeklySummaries.loading,
  fetchError: weeklySummaries.fetchError,
});

const mapDispatchToProps = dispatch => {
  return {
    updateWeeklySummaries: (userId, weeklySummary) =>
      updateWeeklySummaries(userId, weeklySummary)(dispatch),
    getWeeklySummaries: userId => getUserWeeklySummaries(userId)(dispatch),
    getUserProfile: userId => getUserProfile(userId)(dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummary);

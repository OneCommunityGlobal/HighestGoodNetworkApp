import React, { Component } from 'react';
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
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries';
import DueDateTime from './DueDateTime';
import moment from 'moment';
import 'moment-timezone';
import SkeletonLoading from '../common/SkeletonLoading';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { WeeklySummaryContentTooltip, MediaURLTooltip } from './WeeklySummaryTooltips';
import classnames from 'classnames';
import { getUserProfile } from 'actions/userProfile';
import { boxStyle } from 'styles';
import CurrentPromptModal from './CurrentPromptModal.jsx';

// Need this export here in order for automated testing to work.
export class WeeklySummary extends Component {
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
    moveSelect: '1',
    movePopup: false,
    summaryLabel: '',
    wordCount: 0,
    summaryLabel: '',
    wordCount: 0,
  };

  async componentDidMount() {
    await this.props.getWeeklySummaries(this.props.asUser || this.props.currentUser.userid);

    const { mediaUrl, weeklySummaries, weeklySummariesCount } = this.props.summaries;

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
    const dueDate = moment(dueDateThisWeek).isBefore(this.state.dueDate)
      ? this.state.dueDate
      : dueDateThisWeek;

    // Calculate due dates for the last three weeks by subtracting 1, 2, and 3 weeks from the current due date
    // and then setting the due date to the end of the ISO week (Saturday) for each respective week
    const dueDateLastWeek = moment(dueDate)
      .subtract(1, 'weeks')
      .toISOString();

    const dueDateBeforeLast = moment(dueDate)
      .subtract(2, 'weeks')
      .startOf('isoWeek')
      .add(5, 'days');
    const dueDateThreeWeeksAgo = moment(dueDate)
      .subtract(3, 'weeks')
      .startOf('isoWeek')
      .add(5, 'days');

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
      fetchError: this.props.fetchError,
      loading: this.props.loading,
      editPopup: false,
      mediaChangeConfirm: false,
      moveSelect: '1',
      summaryLabel: 'summary',
      wordCount: 0,
    });
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
    const activeTab = this.state.activeTab;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  };

  toggleMovePopup = showPopup => {
    this.setState({ movePopup: !showPopup });
  };

  toggleShowPopup = showPopup => {
    const mediaChangeConfirm = this.state.mediaChangeConfirm;
    if (!mediaChangeConfirm) {
      this.setState({ editPopup: !showPopup });
    } else {
      this.setState({ editPopup: false });
    }
  };

  handleMoveSelect = moveWeek => {
    const moveSelect = this.state.moveSelect;
    this.setState({ moveSelect: moveWeek, movePopup: true });
  };

  handleMove = () => {
    const moveSelect = this.state.moveSelect;
    const newformElements = { ...this.state.formElements };
    const activeTab = this.state.activeTab;
    if (activeTab != moveSelect) {
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
      }
    }
    //confitm move or not
    const movePop = this.state.movePopup;
    this.toggleMovePopup(movePop);
    return newformElements;
  };

  // Minimum word count of 50 (handle words that also use non-ASCII characters by counting whitespace rather than word character sequences).
  regexPattern = new RegExp(/^\s*(?:\S+(?:\s+|$)){50,}$/);
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

  validate = () => {
    const options = { abortEarly: false };
    const result = Joi.validate(this.state.formElements, this.schema, options);
    if (!result.error) return null;
    const errors = {};
    for (let item of result.error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value, type, checked }) => {
    let attr = type === 'checkbox' ? checked : value;
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
    event.persist();
    const { name, value } = event.target;
    const formElements = { ...this.state.formElements };
    if (this.state.mediaChangeConfirm) {
      const errors = { ...this.state.errors };
      const errorMessage = this.validateProperty(event.target);
      if (errorMessage) errors[name] = errorMessage;
      else delete errors[name];
      formElements[name] = value;
      this.setState({ formElements, errors });
    } else {
      this.toggleShowPopup(this.state.editPopup);
    }
  };

  handleMediaChange = event => {
    this.setState({
      mediaChangeConfirm: true,
    });

    this.toggleShowPopup(this.state.editPopup);
  };

  handleEditorChange = (content, editor) => {
    // Filter out blank pagagraphs inserted by tinymce replacing new line characters. Need those removed so Joi could do word count checks properly.
    const filteredContent = content.replace(/<p>&nbsp;<\/p>/g, '');
    const errors = { ...this.state.errors };
    const errorMessage = this.validateEditorProperty(filteredContent, editor.id);
    if (errorMessage) errors[editor.id] = errorMessage;
    else delete errors[editor.id];

    const formElements = { ...this.state.formElements };
    formElements[editor.id] = content;
    this.setState({ formElements, errors });
  };

  handleCheckboxChange = event => {
    event.persist();
    const { name, checked } = event.target;
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ...this.state.formElements };
    formElements[name] = checked;
    this.setState({ formElements, errors });
  };

  handleChangeInSummary = async() => {
    // Extract state variables for ease of access
    let {
      submittedDate,
      formElements,
      uploadDatesElements,
      originSummaries,
      dueDate,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
    } = this.state;
    let newformElements = { ...formElements };
    let newOriginSummaries = { ...originSummaries };
    let newUploadDatesElements = { ...uploadDatesElements };
    let dueDates = [dueDate, dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo];
    //Move or not, if did move, update the newformElements
    const moveSelect = this.state.moveSelect;
    const activeTab = this.state.activeTab;
    const moveConfirm = this.state.moveConfirm;
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
    let currentSubmittedCount = summaries.reduce((count, summary) => {
      return newformElements[summary] !== '' ? count + 1 : count;
    }, 0);
    const diffInSubmittedCount = currentSubmittedCount - this.state.submittedCountInFourWeeks;
    if (diffInSubmittedCount !== 0) {
      this.setState({ summariesCountShowing: newformElements.weeklySummariesCount + 1 });
    }
    const updateSummary = (summary, uploadDate) => {
      if (newformElements[summary] !== newOriginSummaries[summary]) {
        newOriginSummaries[summary] = newformElements[summary];
        newUploadDatesElements[uploadDate] =
          newformElements[summary] == '' ? dueDate : submittedDate;
        this.setState({
          formElements: newformElements,
          uploadDatesElements: newUploadDatesElements,
          originSummaries: newOriginSummaries,
        });
      }
    };
    // Loop through summaries and update state variables
    for (let i = 0; i < summaries.length; i++) {
      updateSummary(summaries[i], uploadDates[i]);
    }
    
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
    return this.props.updateWeeklySummaries(
      this.props.asUser || this.props.currentUser.userid,
      modifiedWeeklySummaries,
    );
  };

  // Updates user profile and weekly summaries
  updateUserData = async userId => {
    await this.props.getUserProfile(userId);
    await this.props.getWeeklySummaries(userId);
  };
  // Handler for success scenario after save
  handleSaveSuccess = async toastIdOnSave => {
    toast.success('✔ The data was saved successfully!', {
      toastId: toastIdOnSave,
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
    await this.updateUserData(this.props.asUser || this.props.currentUser.userid);
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
    //error detect
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    const result = await this.handleChangeInSummary();

    if (result === 200) {
      await this.handleSaveSuccess(toastIdOnSave);
      if (closeAfterSave) {
        this.handleClose();
      }
    } else {
      toast.error('✘ The data could not be saved!', {
        toastId: toastIdOnSave,
        pauseOnFocusLoss: false,
        autoClose: 3000,
      });
    }
  };

  handleMoveSave = async event => {
    if (event) {
      event.preventDefault();
    }
    this.state.moveConfirm = true;
    this.mainSaveHandler(false);
    if (this.state.moveConfirm) {
      this.toggleTab(this.state.moveSelect);
    }
  };

  handleSave = async event => {
    if (event) {
      event.preventDefault();
    }
    this.mainSaveHandler(true);
  };

  handleClose = () => {
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
    } = this.state;

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

    const wordCount = this.state.wordCount;

    if (fetchError) {
      return (
        <Container>
          <Row className="align-self-center" data-testid="error">
            <Col>
              <Alert color="danger">Fetch error! {fetchError.message}</Alert>
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

    if (this.props.isDashboard) {
      return <DueDateTime isShow={this.props.isPopup} dueDate={moment(dueDate)} />;
    }

    return (
      <Container fluid={this.props.isModal ? true : false} className="bg--white-smoke py-3 mb-5">
        <h3>Weekly Summaries</h3>
        {/* Before clicking Save button, summariesCountShowing is 0 */}
        <Row>
          <Col md="9">
            Total submitted:{' '}
            {this.state.summariesCountShowing || this.state.formElements.weeklySummariesCount}
          </Col>
          <Col md="3">
            <Button className="btn--dark-sea-green" onClick={this.handleClose}>
              Close this window
            </Button>
          </Col>
        </Row>
        <Form className="mt-4">
          <Nav tabs>
            {Object.values(summariesLabels).map((weekName, i) => {
              let tId = String(i + 1);
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
              let tId = String(i + 1);
              return (
                <TabPane tabId={tId} key={tId}>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for={summaryName} className="summary-instructions-row d-flex p-2 justify-content-between">
                          <div>
                            Enter your weekly summary below. (required){' '}
                            <WeeklySummaryContentTooltip tabId={tId} />
                          </div>
                          <UncontrolledDropdown>
                            <DropdownToggle className="px-5 btn--dark-sea-green" caret>
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
                          <CurrentPromptModal />
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
                        errors.summaryThreeWeeksAgo) && (
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
                <Label for="mediaUrl" className="mt-1">
                  Dropbox link to your weekly media files. (required) <MediaURLTooltip />
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
                    {
                      <Modal isOpen={this.state.editPopup}>
                        <ModalHeader> Warning!</ModalHeader>
                        <ModalBody>
                          Whoa Tiger! Are you sure you want to do that? This link was added by an
                          Admin when you were set up as a member of the team. Only change this if
                          you are SURE your new link is more correct than the one already here.
                        </ModalBody>
                        <ModalFooter>
                          <Button onClick={this.handleMediaChange} style={boxStyle}>
                            Confirm
                          </Button>{' '}
                          <Button
                            onClick={() => this.toggleShowPopup(this.state.editPopup)}
                            style={boxStyle}
                          >
                            Close
                          </Button>{' '}
                        </ModalFooter>
                      </Modal>
                    }
                    {errors.mediaUrl && <Alert color="danger">{errors.mediaUrl}</Alert>}
                  </Col>
                  {formElements.mediaUrl && !errors.mediaUrl && (
                    <Col md={4}>
                      <FormGroup className="media-url">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                        <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">
                          Open link
                        </a>
                      </FormGroup>
                    </Col>
                  )}
                  {
                    <Modal isOpen={this.state.movePopup} toggle={this.toggleMovePopup}>
                      <ModalHeader> Warning!</ModalHeader>
                      <ModalBody>Are you SURE you want to move the summary?</ModalBody>
                      <ModalFooter>
                        <Button onClick={this.handleMoveSave}>Confirm and Save</Button>
                        <Button onClick={this.toggleMovePopup}>Close</Button>
                      </ModalFooter>
                    </Modal>
                  }
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
                        disabled={this.validate()}
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
  fetchError: PropTypes.any,
  getWeeklySummaries: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
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
    getWeeklySummaries: getWeeklySummaries,
    updateWeeklySummaries:(userId,weeklySummary)=> updateWeeklySummaries(userId,weeklySummary)(dispatch),
    getWeeklySummaries: userId => getWeeklySummaries(userId)(dispatch),
    getUserProfile: userId => getUserProfile(userId)(dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummary);
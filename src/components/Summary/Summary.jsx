import React, { Component } from 'react';
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
  TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import './Summary.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import DueDateTime from './DueDateTime';
import moment from 'moment';
import 'moment-timezone';
import Joi from 'joi';
import { toast } from "react-toastify";
import { SummaryContentTooltip, MediaURLTooltip } from './SummaryTooltips';
import classnames from 'classnames';

class Summary extends Component {

  state = {
    formElements: { summary: '', mediaUrl: '', mediaConfirm: false },
    dueDate: moment().tz('America/Los_Angeles').endOf('week'),
    userProfile: {},
    activeTab: '1',
    errors: {},
  };

  async componentDidMount() {
    await this.props.getUserProfile(this.props.currentUser.userid);
    this.setState({
      formElements: {
        summary: this.props.summary || '',
        mediaUrl: this.props.mediaUrl || '',
        mediaConfirm: false,
      },
      userProfile: this.props.userProfile || {},
      activeTab: '1',
    });
  };

  toggleTab = tab => {
    const activeTab = this.state.activeTab;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
    };
  }

  schema = {
    mediaUrl: Joi.string().trim().uri().required().label("Media URL"),
    summary: Joi.optional(),
    mediaConfirm: Joi.boolean().invalid(false).label("Media Confirm"),
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
    let attr = (type === "checkbox") ? checked : value;
    const obj = { [name]: attr };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleInputChange = (event) => {
    event.persist();
    const { name, value } = event.target;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ...this.state.formElements };
    formElements[name] = value;
    this.setState({ formElements, errors });
  };

  handleEditorChange = (content, editor) => {
    const formElements = { ...this.state.formElements };
    formElements[editor.id] = content;
    this.setState({ formElements });
  };

  handleCheckboxChange = (event) => {
    event.persist();
    const { name, checked } = event.target;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ...this.state.formElements };
    formElements[name] = checked;
    this.setState({ formElements, errors });
  }

  handleSave = async event => {
    event.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    let [weeklySummary, ...rest] = this.state.userProfile.weeklySummary;
    let weeklySummaryNew = { ...weeklySummary, summary: this.state.formElements.summary, dueDate: this.state.dueDate };

    const userProfileWithSummaryUpdates = {
      ...this.state.userProfile,
      mediaUrl: this.state.formElements.mediaUrl.trim(),
      weeklySummary: [weeklySummaryNew, ...rest],
    }

    const saveResult = await this.props.updateUserProfile(this.props.currentUser.userid, userProfileWithSummaryUpdates);

    if (saveResult === 200) {
      toast.success("✔ The summary was saved!");
    } else {
      toast.error("✘ The summary could not be saved!");
    }
  };

  render() {
    const { formElements, dueDate, userProfile, activeTab, errors } = this.state;

    return (
      <Container fluid className="bg--white-smoke py-3 mb-5">
        <h3>Weekly Summary</h3>
        <Row>
          <Col
            className="pb-2 text-center"
            sm="12"
            md={{ size: 5, offset: 7 }}
            lg={{ size: 4, offset: 8 }}
          >
            <DueDateTime dueDate={dueDate} />
          </Col>
        </Row>

        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' })} onClick={() => { this.toggleTab('1'); }}>
              This Week
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '2' })} onClick={() => { this.toggleTab('2'); }}>
              Last Week
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '3' })} onClick={() => { this.toggleTab('3'); }}>
              Week Before Last
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab} className="p-4">
          <TabPane tabId="1">
            <Row>
              <Col>
                <Form>
                  <FormGroup>
                    <Label for="summaryContent">
                      Enter your weekly summary below weekly below. <SummaryContentTooltip />
                    </Label>
                    <Editor
                      init={{
                        menubar: false,
                        placeholder: 'Weekly summary content...',
                        plugins:
                          'advlist autolink autoresize lists link charmap table paste help wordcount',
                        toolbar:
                          'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
                        branding: false,
                        min_height: 180,
                        max_height: 500,
                        autoresize_bottom_margin: 1,
                      }}
                      id="summary"
                      name="summary"
                      value={formElements.summary}
                      onEditorChange={this.handleEditorChange}
                    />
                  </FormGroup>
                  <Label for="mediaURL" className="mt-3">
                    Link to your media files (eg. DropBox or Google Doc). (required) <MediaURLTooltip />
                  </Label>
                  <Row form>
                    <Col md={8}>
                      <FormGroup>
                        <Input
                          type="url"
                          name="mediaUrl"
                          id="mediaUrl"
                          placeholder="Enter a link"
                          value={formElements.mediaUrl}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                      {errors.mediaUrl && <Alert color="danger">{errors.mediaUrl}</Alert>}
                    </Col>
                    {formElements.mediaUrl && !errors.mediaUrl && (
                      <Col md={4}>
                        <FormGroup className="media-url">
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                          <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">Open link</a>
                        </FormGroup>
                      </Col>
                    )}
                  </Row>
                  <Row>
                    <Col>
                      <FormGroup>
                        <CustomInput
                          id="mediaConfirm"
                          name="mediaConfirm"
                          type="checkbox"
                          label="I have provided screenshots and video for this week's work. (required)" htmlFor="mediaConfirm"
                          checked={formElements.mediaConfirm}
                          valid={formElements.mediaConfirm}
                          onChange={this.handleCheckboxChange}
                        />
                      </FormGroup>
                      {errors.mediaConfirm && <Alert color="danger">Please confirm that you have provided the required media files.</Alert>}
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col>
                      <FormGroup className="mt-2">
                        <Button className="px-5 btn--dark-sea-green" disabled={this.validate() || (!formElements.mediaUrl && !formElements.summary) ? true : false} onClick={this.handleSave}>Save</Button>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col>
                <Editor
                  init={{ menubar: false, plugins: 'autoresize', toolbar: '', branding: false, min_height: 180, max_height: 500, statusbar: false }}
                  id="summary-last-week"
                  name="summary-last-week"
                  value={userProfile.weeklySummary && userProfile.weeklySummary[1] && userProfile.weeklySummary[1].summary}
                  disabled
                />
              </Col>
            </Row>
            {formElements.mediaUrl && (
              <Row className="mt-3">
                <Col>
                  <div>
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                    <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">Open link to media files</a>
                  </div>
                </Col>
              </Row>
            )}
          </TabPane>
          <TabPane tabId="3">
            <Row>
              <Col sm="12">
                <Editor
                  init={{
                    menubar: false, plugins: 'autoresize', toolbar: '', branding: false, min_height: 180, max_height: 500, statusbar: false,
                  }}
                  id="summary-week-before-last"
                  name="summary-week-before-last"
                  value={userProfile.weeklySummary && userProfile.weeklySummary[2] && userProfile.weeklySummary[2].summary}
                  disabled
                />
              </Col>
            </Row>
            {formElements.mediaUrl && (
              <Row className="mt-3">
                <Col>
                  <div>
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                    <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">Open link to media files</a>
                  </div>
                </Col>
              </Row>
            )}
          </TabPane>

        </TabContent>
      </Container >
    );
  }
}


const mapStateToProps = ({ auth, userProfile }) => ({
  currentUser: auth.user,
  summary: userProfile.weeklySummary && userProfile.weeklySummary[0] && userProfile.weeklySummary[0].summary ? userProfile.weeklySummary[0].summary : '',
  dueDate: userProfile.weeklySummary && userProfile.weeklySummary[0] && userProfile.weeklySummary[0].dueDate ? userProfile.weeklySummary[0].dueDate : '',
  mediaUrl: userProfile.mediaUrl,
  userProfile: userProfile,
});

export default connect(mapStateToProps, { getUserProfile, updateUserProfile })(Summary);

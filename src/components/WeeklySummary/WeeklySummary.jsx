import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, Container, Row, Col, Form, FormGroup, Label, Input,
  CustomInput, Button, TabContent, TabPane, Nav, NavItem, NavLink,
} from 'reactstrap';
import './WeeklySummary.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries'
import DueDateTime from './DueDateTime';
import moment from 'moment';
import 'moment-timezone';
import Loading from '../common/Loading';
import Joi from 'joi';
import { toast } from "react-toastify";
import { WeeklySummaryContentTooltip, MediaURLTooltip } from './WeeklySummaryTooltips';
import classnames from 'classnames';

class WeeklySummary extends Component {

  state = {
    formElements: {
      summary: '',
      summaryLastWeek: '',
      summaryBeforeLast: '',
      mediaUrl: '',
      weeklySummariesCount: 0,
      mediaConfirm: false
    },
    dueDate: moment().tz('America/Los_Angeles').endOf('week'),
    dueDateLastWeek: moment().tz('America/Los_Angeles').endOf('week').subtract(1, 'week').toISOString(),
    dueDateBeforeLast: moment().tz('America/Los_Angeles').endOf('week').subtract(2, 'week').toISOString(),
    activeTab: '1',
    errors: {},
    fetchError: null,
    loading: true,
  };

  async componentDidMount() {
    await this.props.getWeeklySummaries(this.props.currentUser.userid);
    const { mediaUrl, weeklySummaries, weeklySummariesCount } = this.props.summaries;

    this.setState({
      formElements: {
        summary: weeklySummaries && weeklySummaries[0] && weeklySummaries[0].summary ? weeklySummaries[0].summary : '',
        summaryLastWeek: weeklySummaries && weeklySummaries[1] && weeklySummaries[1].summary || '',
        summaryBeforeLast: weeklySummaries && weeklySummaries[2] && weeklySummaries[2].summary || '',
        mediaUrl: mediaUrl || '',
        weeklySummariesCount: weeklySummariesCount || 0,
        mediaConfirm: false,
      },
      dueDateLastWeek: weeklySummaries && weeklySummaries[1] && weeklySummaries[1].dueDate || this.state.dueDateLastWeek,
      dueDateBeforeLast: weeklySummaries && weeklySummaries[2] && weeklySummaries[2].dueDate || this.state.dueDateBeforeLast,
      activeTab: '1',
      fetchError: this.props.fetchError,
      loading: this.props.loading,
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
    summaryLastWeek: Joi.optional(),
    summaryBeforeLast: Joi.optional(),
    weeklySummariesCount: Joi.optional(),
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

    const modifiedWeeklySummaries = {
      mediaUrl: this.state.formElements.mediaUrl.trim(),
      weeklySummaries: [
        { summary: this.state.formElements.summary, dueDate: this.state.dueDate.toISOString() },
        { summary: this.state.formElements.summaryLastWeek, dueDate: this.state.dueDateLastWeek },
        { summary: this.state.formElements.summaryBeforeLast, dueDate: this.state.dueDateBeforeLast },
      ],
      weeklySummariesCount: this.state.formElements.weeklySummariesCount,
    }

    const saveResult = await this.props.updateWeeklySummaries(this.props.currentUser.userid, modifiedWeeklySummaries);

    if (saveResult === 200) {
      toast.success("✔ The data was saved successfully!");
    } else {
      toast.error("✘ The data could not be saved!");
    }
  };

  render() {
    const { formElements, dueDate, activeTab, errors, loading, fetchError } = this.state;
    const summariesLabels = {
      'summary': 'This Week',
      'summaryLastWeek': 'Last Week',
      'summaryBeforeLast': 'Week Before Last',
    };

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
            <Loading />
          </Row>
        </Container>
      );
    }

    return (
      <Container fluid className="bg--white-smoke py-3 mb-5">
        <h3>Weekly Summaries</h3>
        <div>Total submitted: {formElements.weeklySummariesCount}</div>
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

        <Form>
          <Nav tabs>
            {Object.values(summariesLabels).map((weekName, i) => {
              let tId = String(i + 1);
              return (
                <NavItem key={tId}>
                  <NavLink
                    className={classnames({ active: activeTab === tId })} onClick={() => { this.toggleTab(tId); }}>
                    {weekName}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
          <TabContent activeTab={activeTab} className="p-4">
            {Object.keys(summariesLabels).map((summaryName, i) => {
              let tId = String(i + 1);
              return (
                <TabPane tabId={tId} key={tId}>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for="summaryContent">
                          Enter your weekly summary below. <WeeklySummaryContentTooltip />
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
                          id={summaryName}
                          name={summaryName}
                          value={formElements[summaryName]}
                          onEditorChange={this.handleEditorChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </TabPane>
              );
            })}
            <Row>
              <Col>
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
                      <Button className="px-5 btn--dark-sea-green" disabled={this.validate() || !formElements.mediaUrl ? true : false} onClick={this.handleSave}>Save</Button>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </TabContent>
        </Form>
      </Container >
    );
  }
}

WeeklySummary.propTypes = {
  currentUser: PropTypes.shape({
    userid: PropTypes.string.isRequired
  }).isRequired,
  fetchError: PropTypes.any,
  getWeeklySummaries: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  summaries: PropTypes.object.isRequired,
  updateWeeklySummaries: PropTypes.func.isRequired
}

const mapStateToProps = ({ auth, weeklySummaries }) => ({
  currentUser: auth.user,
  summaries: weeklySummaries.summaries,
  loading: weeklySummaries.loading,
  fetchError: weeklySummaries.fetchError,
});

export default connect(mapStateToProps, { getWeeklySummaries, updateWeeklySummaries })(WeeklySummary);

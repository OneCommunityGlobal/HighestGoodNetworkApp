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
  Button,
} from 'reactstrap';
import './Summary.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import DueDateTime from './DueDateTime';
import _ from 'lodash';
import moment from 'moment';
import Joi from 'joi';
import { toast } from "react-toastify";

class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formElements: { summary: '', mediaUrl: '' },
      dueDate: moment().endOf('week'),
      userProfile: {},
      errors: {},
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  async componentDidMount() {
    await this.props.getUserProfile(this.props.currentUser.userid);
    this.setState({
      formElements: {
        summary: this.props.summary || '',
        mediaUrl: this.props.mediaUrl || ''
      },
      userProfile: this.props.userProfile || {},
    })
  };

  schema = {
    mediaUrl: Joi.string().trim().uri().required().label("Media URL"),
    summary: Joi.optional(),
  };

  validate = () => {
    const options = { abortEarly: false };
    const result = Joi.validate(this.state.formElements, this.schema, options);
    if (!result.error) return null;
    const errors = {};
    for (let item of result.error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
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
    const { formElements, dueDate, errors } = this.state;

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
            <DueDateTime dueDate={dueDate.format('YYYY-MM-DD')} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Form>
              <FormGroup>
                <Label for="summaryContent">
                  Enter your weekly summary below
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
                Link to your media files (eg. DropBox or Google Doc)
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
                {formElements.mediaUrl && !this.validate() && (
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
              <FormGroup className="mt-2">
                <Button className="px-5 btn--dark-sea-green" disabled={this.validate() || (!formElements.mediaUrl && !formElements.summary) ? true : false} onClick={this.handleSave}>Save</Button>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      </Container >
    );
  }
}


const mapStateToProps = ({ auth, userProfile }) => ({
  currentUser: auth.user,
  summary: userProfile.weeklySummary && userProfile.weeklySummary[0] && userProfile.weeklySummary[0].summary ? userProfile.weeklySummary[0].summary : '',
  mediaUrl: userProfile.mediaUrl,
  userProfile: userProfile,
});

export default connect(mapStateToProps, { getUserProfile, updateUserProfile })(Summary);

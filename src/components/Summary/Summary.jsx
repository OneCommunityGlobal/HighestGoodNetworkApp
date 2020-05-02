import React, { useState } from 'react';
import {
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
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tinymce/tinymce-react';
import DueDateTime from './DueDateTime';

function Summary() {
  const initialState = {
    dueDate: moment().format('YYYY-MM-DD'),
    dueHour: '23:59',
    summary: '',
    mediaUrl: 'https://www.dropbox.com/',
  };

  const [inputs, setInputs] = useState(initialState);

  const handleInputChange = (event) => {
    event.persist();
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: value });
  };

  const handleEditorChange = (content, editor) => {
    setInputs({ ...inputs, [editor.id]: content });
  };

  return (
    <Container fluid className="bg--white-smoke py-3">
      <h3>Weekly Summary</h3>
      <Row>
        <Col
          className="pb-2 text-center"
          sm="12"
          md={{ size: 5, offset: 7 }}
          lg={{ size: 4, offset: 8 }}
        >
          <DueDateTime />
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
                value={inputs.summary}
                onEditorChange={handleEditorChange}
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
                    value={inputs.mediaUrl}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </Col>
              {inputs.mediaUrl && (
                <Col md={4}>
                  <FormGroup className="media-url">
                    <FontAwesomeIcon
                      icon={faExternalLinkAlt}
                      className="mx-1 text--silver"
                    />
                    <a
                      href={inputs.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open link
                    </a>
                  </FormGroup>
                </Col>
              )}
            </Row>
            <FormGroup className="mt-5">
              <Button className="px-5 btn--dark-sea-green">Save</Button>
              <Button className="px-5 btn--white-smoke float-right">
                Submit for Review
              </Button>
            </FormGroup>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Summary;

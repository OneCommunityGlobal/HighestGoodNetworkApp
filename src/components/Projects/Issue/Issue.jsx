import React, { useState } from 'react';
import { Button, Label, Input, Form, FormGroup, Row, Col } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import './Issue.css';
import { check } from 'prettier';
import { useEffect } from 'react';

const Issue = (props) => {
  const ISSUE_FORM_HEADER = 'ISSUE LOG';
  const ISSUE_DATE = 'Issue Date:';
  const ISSUE_TYPE = 'Issue Type:';
  const CONSEQUENCES_TITLE = 'Consequence(s): select all that apply';
  const NOTE = 'Note: MET means Materials, Equipment and/or Tool.';
  const DESCRIPTION_PLACEHOLDER =
    "Description the issue as detailed as possible.\n (minimum 100 characters)\n • What happened?\n • Who's involved\n • How did it happen?\n • What was the immediate action taken?\n • If there were any witnesses, who are they?\n";
  const RESOLVED = 'Resolved?';
  const DESCRIPTION = 'Description:';
  const defaultOption = 'Safety';
  const maxDescriptionCharacterLimit = 500;
  const history = useHistory();

  const dropdownOptions = ['Safety', 'METs quality / functionality', 'Labor', 'Weather', 'Other'];

  const safetyCheckboxOptions = [
    'MET Damage/Waste',
    'Schedule Delay',
    'Minor Injury',
    'Major Injury',
    'Other',
  ];

  const metQualityCheckboxOptions = ['Require Reorder of MET', 'Schedule Delay', 'Other'];

  const laborCheckboxOptions = ['Quality Issue', 'Schedule Delay', 'Other'];

  const weatherCheckboxOptions = ['Require Reorder of MET', 'Schedule Delay', 'Other'];

  const otherOption = ['Other'];

  const [formData, setFormData] = useState({
    dateOfWork: '',
    dropdown: '',
    checkboxes: [],
    other: '',
    resolved: '',
    description: '',
  });

  const [checkboxOptions, setCheckboxOption] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);

  const handleCheckboxChange = (index) => {
    console.log('index: ' + index);
  };

  const handleDescriptionChange = (e) => {
    let currentDescription = e.target.value;

    if (currentDescription.length > maxDescriptionCharacterLimit) {
      currentDescription = currentDescription.slice(0, maxDescriptionCharacterLimit);
    }

    setFormData({ ...formData, description: currentDescription });
    setCharacterCount(currentDescription.length);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    history.push('/bmdashboard/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submit');

    const isDataValid = validateData(formData);
  };

  const validateData = (currentFormData) => {
    let isValid = true;

    if (!formData.dateOfWork) {
      console.log('Date of Work is required');
      return;
    }

    if (!formData.dropdown) {
      console.log('Issue Type is required');
      return;
    }

    if (!formData.checkboxes) {
      console.log('Consequence(s) is required');
      return;
    }

    // figure out other text option

    if (!formData.resolved) {
      console.log('Resolved is required');
      return;
    }

    if (!formData.description) {
      console.log('Description is required');
      return;
    }

    console.log('Form submitted with data: ', currentFormData);

    return isValid;
  };

  const handleDropdownChange = (event) => {
    const currentDropdownOption = event.target.value;
    console.log('event.target.value: ', currentDropdownOption);
    setFormData({ ...formData, dropdown: currentDropdownOption });
    changeCheckboxOption(currentDropdownOption);
  };

  const changeCheckboxOption = (selectedOption) => {
    let currentCheckboxOption = otherOption;

    if (selectedOption === 'Safety') {
      currentCheckboxOption = safetyCheckboxOptions;
    } else if (selectedOption === 'METs quality / functionality') {
      currentCheckboxOption = metQualityCheckboxOptions;
    } else if (selectedOption === 'Labor') {
      currentCheckboxOption = laborCheckboxOptions;
    } else if (selectedOption === 'Weather') {
      currentCheckboxOption = weatherCheckboxOptions;
    }

    createAndSetCheckboxOptionPairArray(currentCheckboxOption);
  };

  const createAndSetCheckboxOptionPairArray = (currentCheckboxOption) => {
    // Need this logic to dynamically create rows and cols.
    let currentCheckBoxOptionPairArray = [];

    for (let i = 0; i < currentCheckboxOption.length; i += 2) {
      let pair = [];
      if (i + 1 >= currentCheckboxOption.length) {
        pair = [currentCheckboxOption[i]];
      } else {
        pair = [currentCheckboxOption[i], currentCheckboxOption[i + 1]];
      }

      currentCheckBoxOptionPairArray.push(pair);
    }

    setCheckboxOption(currentCheckBoxOptionPairArray);
  };

  useEffect(() => {
    // Run this once during initialization to set default checkbox options.
    createAndSetCheckboxOptionPairArray(safetyCheckboxOptions);
  }, []);

  return (
    <div className="issue-form-container">
      <h4 className="issue-title-text">{ISSUE_FORM_HEADER}</h4>
      <Form>
        <FormGroup>
          <Row className="row-margin-bottom ">
            <Col>
              <Label className="sub-title-text">{ISSUE_DATE}</Label>
            </Col>
            <Col>
              <Input
                className="issue-form-override-css"
                type="date"
                name="dateOfWork"
                id="dateOfWork"
                onChange={(e) => setFormData({ ...formData, dateOfWork: e.target.value })}
              />
            </Col>
          </Row>
          <Row className="red-text">{NOTE}</Row>
        </FormGroup>
        <FormGroup>
          <Row style={{ justifyContent: 'left' }}>
            <Label for="dropdownExample" className="sub-title-text">
              {ISSUE_TYPE}
            </Label>
          </Row>
          <Row>
            <Input
              className="issue-form-override-css"
              type="select"
              name="dropdown"
              id="dropdownExample"
              onChange={handleDropdownChange}
            >
              {dropdownOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
          </Row>
        </FormGroup>
        <FormGroup check>
          <Row>
            <Col>
              <Label className="sub-title-text text-start">{CONSEQUENCES_TITLE}</Label>
            </Col>
          </Row>
          <Row style={{ marginBottom: '2vh' }}>
            {checkboxOptions.map((pair, rowIndex) => (
              <Row key={rowIndex}>
                {pair.map((option, colIndex) => (
                  <Col key={colIndex}>
                    <Label check>
                      <Input
                        type="checkbox"
                        onChange={handleCheckboxChange(rowIndex * 2 + colIndex)}
                      />
                      {option}
                    </Label>
                    {option === 'Other' && (
                      <Input
                        className="issue-form-override-css"
                        type="text"
                        placeholder="If other is selected, please specify."
                        value={formData.other}
                        onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                      />
                    )}
                  </Col>
                ))}
              </Row>
            ))}
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col>
              <Label className="sub-title-text">{RESOLVED}</Label>
            </Col>
          </Row>
          <Row className='issue-radio-buttons'>
            <Col>
              <Label check>
                <Input
                  type="radio"
                  name="radioOption"
                  onChange={(e) => setFormData({ ...formData, resolved: 'Yes' })}
                />
                Yes
              </Label>
            </Col>
            <Col>
              <Label check>
                <Input
                  type="radio"
                  name="radioOption"
                  onChange={(e) => setFormData({ ...formData, resolved: 'No' })}
                />
                No
              </Label>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col>
              <Label for="description" className="sub-title-text">
                {DESCRIPTION}
              </Label>
            </Col>
          </Row>
          <Row className="position-relative">
            <Col>
              <Input
                className="issue-form-override-css"
                style={{ marginBottom: '2vh' }}
                type="textarea"
                placeholder={DESCRIPTION_PLACEHOLDER}
                value={formData.description}
                rows="8"
                onChange={(e) => handleDescriptionChange(e)}
              />
            </Col>
            <div className="character-counter-text">
              {characterCount}/{maxDescriptionCharacterLimit}
            </div>
          </Row>
          {/* <Row className='character-counter-text position-absolute bottom-0 right-0'>
          </Row> */}
        </FormGroup>
        <FormGroup>
          <Row className="text-center">
            <Col>
              <Button className="IssueFormButtonCancel" onClick={(e) => handleCancel(e)}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button className="IssueFormButtonSubmit" onClick={(e) => handleSubmit(e)}>
                Submit
              </Button>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    </div>
  );
};

export default Issue;

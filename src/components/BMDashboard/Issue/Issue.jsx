import { useState } from 'react';
import { Button, Label, Input, Form, FormGroup, Row, Col } from 'reactstrap';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import './Issue.css';
import { useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';

function Issue() {
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
  const userData = localStorage.getItem('token');
  const userId = JSON.parse(atob(userData?.split('.')[1]))?.userid;

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
    issueDate: '',
    dropdown: defaultOption,
    checkboxes: new Set(),
    other: '',
    resolved: '',
    description: '',
  });

  const [checkboxOptions, setCheckboxOption] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);

  const handleCheckboxChange = option => {
    setFormData(prevFormData => {
      const newCheckboxes = new Set(prevFormData.checkboxes);

      if (newCheckboxes.has(option)) {
        newCheckboxes.delete(option);
      } else {
        newCheckboxes.add(option);
      }

      return { ...prevFormData, checkboxes: newCheckboxes };
    });
  };

  const handleOtherInputChange = (e, option) => {
    setFormData({ ...formData, other: e.target.value });

    if (e.target.value.length > 0 && e.target.value.trim() && !formData.checkboxes.has(option)) {
      handleCheckboxChange(option);
    } else if (formData.checkboxes.has(option) && e.target.value.trim().length === 0) {
      handleCheckboxChange(option);
    }
  };
  const handleDescriptionChange = e => {
    let currentDescription = e.target.value;

    if (currentDescription.length > maxDescriptionCharacterLimit) {
      currentDescription = currentDescription.slice(0, maxDescriptionCharacterLimit);
    }

    setFormData({ ...formData, description: currentDescription });
    setCharacterCount(currentDescription.trim().length);
  };

  const handleCancel = e => {
    e.preventDefault();
    history.push('/bmdashboard/');
  };

  const validateData = currentFormData => {
    // Declaring date vars with current device time to check if issue date is in the future.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (!currentFormData.issueDate) {
      toast.error('Issue Date is required.');
      return false;
    }

    if (currentFormData.issueDate > todayStr) {
      toast.error('Issue Date cannot be in the future.');
      return false;
    }

    if (!currentFormData.dropdown) {
      toast.error('Issue Type is required.');
      return false;
    }

    if (currentFormData.checkboxes.size === 0) {
      toast.error('Consequence(s) is required.');
      return false;
    }

    if (
      currentFormData.checkboxes &&
      ((currentFormData.checkboxes.has('Other') && currentFormData.other.trim().length <= 0) ||
        (!currentFormData.checkboxes.has('Other') && currentFormData.other.trim().length > 0))
    ) {
      toast.error('Please specify the other consequence.');
      return false;
    }

    if (!currentFormData.resolved) {
      toast.error('Resolved is required.');
      return false;
    }

    if (currentFormData.description.trim().length <= 100) {
      toast.error('Please add a mininum of 100 characters to Description.');
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isDataValid = validateData(formData);
    const issueConsequences = Array.from([
      ...formData.checkboxes,
      formData.other.trim() === '' ? null : formData.other.trim(),
    ]).filter(Boolean);
    const currentFormData = {
      issueDate: formData.issueDate,
      issueType: formData.dropdown,
      issueConsequences,
      issueResolved: formData.resolved === 'Yes',
      issueDescription: formData.description,
      createdBy: userId,
    };
    if (!isDataValid) {
      return false;
    }
    await axios
      .post(`${ENDPOINTS.BM_ISSUE_FORM}`, currentFormData)
      .then(() => {
        toast.success('Issue Form Submitted Successfully');
        return true;
      })
      .catch(() => {
        toast.error('Issue Form Submission Failed');
        return false;
      });
    return isDataValid;
  };

  const createAndSetCheckboxOptionPairArray = currentCheckboxOption => {
    // Need this logic to dynamically create rows and cols.
    const currentCheckBoxOptionPairArray = [];

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

  const changeCheckboxOption = selectedOption => {
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

  const handleDropdownChange = option => {
    setFormData({ ...formData, dropdown: option, checkboxes: new Set(), other: '' });
    changeCheckboxOption(option);
  };

  useEffect(() => {
    // Run this once during initialization to set default dropdown/checkbox options.
    createAndSetCheckboxOptionPairArray(safetyCheckboxOptions);
    handleDropdownChange(defaultOption);
  }, []);

  return (
    <div className="issue-form-container">
      <h4 className="issue-title-text">{ISSUE_FORM_HEADER}</h4>
      <Form>
        <FormGroup>
          <Row className="issue-date">
            <Col className="d-flex justify-content-center">
              <Label className="sub-title-text">
                <span className="red-asterisk">* </span>
                {ISSUE_DATE}
              </Label>
            </Col>
            <Col>
              <Input
                className="issue-form-override-css issue-date-input"
                type="date"
                name="issueDate"
                id="issueDate"
                required
                min={new Date('2020-01-01').toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </Col>
          </Row>
        </FormGroup>
        <Row>
          <Col>
            <Label className="red-text">{NOTE}</Label>
          </Col>
        </Row>
        <FormGroup>
          <Row>
            <Col>
              <Label className="sub-title-text">
                <span className="red-asterisk">* </span>
                {ISSUE_TYPE}
              </Label>
            </Col>
          </Row>
          <Row>
            <Col>
              <Input
                className="issue-form-override-css"
                type="select"
                name="dropdown"
                value={formData.dropdown}
                onChange={e => handleDropdownChange(e.target.value)}
                required
              >
                {dropdownOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Col>
              <Label className="sub-title-text">
                <span className="red-asterisk">* </span>
                {CONSEQUENCES_TITLE}
              </Label>
            </Col>
          </Row>
          {checkboxOptions.map(pair => (
            <Row key={pair} className="consequences-checkboxes">
              {pair.map(option => (
                <Col key={option}>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={formData.checkboxes.has(option) || false}
                      onChange={() => handleCheckboxChange(option)}
                      required
                    />
                    {option}
                  </Label>
                  {option === 'Other' && (
                    <Input
                      className="issue-form-override-css"
                      type="textarea"
                      rows="1"
                      placeholder="If other is selected, please specify."
                      value={formData.other}
                      onChange={e => handleOtherInputChange(e, option)}
                      required={formData.checkboxes.has(option)}
                      disabled={!formData.checkboxes.has(option)}
                    />
                  )}
                </Col>
              ))}
            </Row>
          ))}
        </FormGroup>
        <FormGroup>
          <Row>
            <Col>
              <Label className="sub-title-text">
                <span className="red-asterisk">* </span>
                {RESOLVED}
              </Label>
            </Col>
          </Row>
          <Row className="issue-radio-buttons">
            <Col className="issue-radio-buttons">
              <Label check>
                <Input
                  type="radio"
                  name="radioOption"
                  onChange={() => setFormData({ ...formData, resolved: 'Yes' })}
                  required
                />
                Yes
              </Label>
            </Col>
            <Col className="issue-radio-buttons">
              <Label check>
                <Input
                  type="radio"
                  name="radioOption"
                  onChange={() => setFormData({ ...formData, resolved: 'No' })}
                  required
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
                <span className="red-asterisk">* </span>
                {DESCRIPTION}
              </Label>
            </Col>
          </Row>
          <Row className="position-relative">
            <Col>
              <Input
                className="issue-form-override-css row-margin-bottom"
                type="textarea"
                id="description"
                placeholder={DESCRIPTION_PLACEHOLDER}
                value={formData.description}
                rows="8"
                onChange={e => handleDescriptionChange(e)}
                required
              />
            </Col>
            <div className="character-counter-text">
              {characterCount}/{maxDescriptionCharacterLimit}
            </div>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row className="text-center">
            <Col>
              <Button className="IssueFormButtonCancel" onClick={e => handleCancel(e)}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button className="IssueFormButtonSubmit" onClick={e => handleSubmit(e)}>
                Submit
              </Button>
            </Col>
          </Row>
        </FormGroup>
      </Form>
    </div>
  );
}

export default Issue;

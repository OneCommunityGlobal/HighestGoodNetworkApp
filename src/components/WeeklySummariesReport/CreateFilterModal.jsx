import { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Form,
  FormFeedback,
  Row,
  Col,
} from 'reactstrap';

import { MultiSelect } from 'react-multi-select-component';
import './CreateFilterModal.css';
import hasPermission from '../../utils/permissions';

const defaultState = {
  teamCodes: [],
  selectedCodes: [],
  teamCodeWarningUsers: [],
  colorOptions: [],
  selectedColors: [],
  selectedExtraMembers: [],
  tableData: [],
  summaries: [],
  selectedTrophies: false,
  selectedSpecialColors: {
    purple: false,
    green: false,
    navy: false,
  },
  selectedBioStatus: false,
  selectedOverTime: false,
};

function CreateFilterModal({ isOpen, toggle, initialState, darkMode, hasPermissionToFilter }) {
  const [state, setState] = useState(() => initialState ?? defaultState);
  const [errors, setErrors] = useState('');

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!state.filterName.trim()) {
      setErrors('Filter name is required');
    } else {
      setErrors('');
    }
  }, [state.filterName]);

  // Update members of membersFromUnselectedTeam dropdown
  const membersFromUnselectedTeam = useMemo(() => {
    // Add all selected member in a Set
    const selectedMemberSet = new Set();

    state.selectedCodes.forEach(code => {
      if (code.value === '') return;
      if (code.value in state.tableData) {
        const team = state.tableData[code.value];
        team.forEach(member => {
          selectedMemberSet.add(member._id);
        });
      }
    });

    // Filter members from unselected set
    const newMembersFromUnselectedTeam = [];
    state.summaries.forEach(summary => {
      if (!selectedMemberSet.has(summary._id)) {
        newMembersFromUnselectedTeam.push({
          label: `${summary.firstName} ${summary.lastName}`,
          value: summary._id,
          role: summary.role,
        });
      }
    });
    return newMembersFromUnselectedTeam;
  }, [state.selectedCodes, state.summaries]);

  const handleFilterNameChange = value => {
    setState(prev => ({
      ...prev,
      filterName: value,
    }));
  };

  const handleSelectCodesChange = event => {
    setState(prev => ({
      ...prev,
      selectedCodes: event,
    }));
  };

  const removeSelectedCode = removeCode => {
    setState(prev => ({
      ...prev,
      selectedCodes: prev.selectedCodes.filter(item => item !== removeCode),
    }));
  };

  const handleSelectColorChange = event => {
    setState(prevState => ({
      ...prevState,
      selectedColors: event,
    }));
  };
  const removeSelectedColor = removeColor => {
    setState(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.filter(item => item !== removeColor),
    }));
  };

  const handleSelectExtraMembersChange = event => {
    setState(prev => ({
      ...prev,
      selectedExtraMembers: event,
    }));
  };

  const removeSelectedExtraMember = removeMember => {
    setState(prev => ({
      ...prev,
      selectedExtraMembers: prev.selectedExtraMembers.filter(item => item !== removeMember),
    }));
  };

  const handleTrophyToggleChange = () => {
    setState(prevState => ({
      ...prevState,
      selectedTrophies: !prevState.selectedTrophies,
    }));
  };

  const handleSpecialColorToggleChange = (color, isEnabled) => {
    setState(prevState => ({
      ...prevState,
      selectedSpecialColors: {
        ...prevState.selectedSpecialColors,
        [color]: isEnabled,
      },
    }));
  };

  const handleBioStatusToggleChange = () => {
    setState(prev => ({
      ...prev,
      selectedBioStatus: !prev.selectedBioStatus,
    }));
  };

  const handleOverHoursToggleChange = () => {
    setState(prev => ({
      ...prev,
      selectedOverTime: !prev.selectedOverTime,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (errors === '') {
      // No errors → submit form
      // eslint-disable-next-line no-console
      console.log('Form submitted:');
      toggle();
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} className="weekly-summaries-report">
      <ModalHeader toggle={toggle}>Create A New Filter</ModalHeader>
      <ModalBody>
        <Form>
          <Label for="filterName">Filter Name *</Label>
          <Input
            id="filterName"
            value={state.filterName}
            onChange={e => handleFilterNameChange(e.target.value)}
            placeholder="Enter filter name"
            required
            invalid={!!errors}
          />
          <FormFeedback>{errors}</FormFeedback>

          <Row className="pt-4">
            <Col md={6} sm={12}>
              <div>
                <b>Select Team Code</b>
              </div>
              <MultiSelect
                className={`report-multi-select-filter top-select text-dark ${
                  darkMode ? 'dark-mode' : ''
                } ${state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''}`}
                options={state.teamCodes.map(item => {
                  const [code, count] = item.label.split(' (');
                  return {
                    ...item,
                    label: `${code.padEnd(10, ' ')} (${count}`,
                  };
                })}
                value={state.selectedCodes}
                onChange={handleSelectCodesChange}
                labelledBy="Select"
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Team Code</div>
              <div className="sm-scrollable">
                {state.selectedCodes.map(item => (
                  <div key={item.value} className="chip">
                    {item.label}
                    <Button
                      close
                      onClick={() => removeSelectedCode(item)}
                      className="min-sz-button px-2"
                      aria-label={`Remove ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col md={6} sm={12}>
              <div>
                <b>Select Color</b>
              </div>
              <MultiSelect
                className={`report-multi-select-filter second-select text-dark ${
                  darkMode ? 'dark-mode' : ''
                }`}
                options={state.colorOptions}
                value={state.selectedColors}
                onChange={handleSelectColorChange}
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Colors</div>
              <div className="sm-scrollable">
                {state.selectedColors.map(item => (
                  <div key={item.value} className="chip">
                    {item.label}
                    <Button
                      close
                      onClick={() => removeSelectedColor(item)}
                      className="min-sz-button px-2"
                      aria-label={`Remove ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col md={6} sm={12}>
              <div>
                <b>Select Extra Members</b>
              </div>
              <MultiSelect
                className={`report-multi-select-filter text-dark ${darkMode ? 'dark-mode' : ''}`}
                options={membersFromUnselectedTeam}
                value={state.selectedExtraMembers}
                onChange={handleSelectExtraMembersChange}
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Extra Members</div>
              <div className="sm-scrollable">
                {state.selectedExtraMembers.map(item => (
                  <div key={item.value} className="chip">
                    {item.label}
                    <Button
                      close
                      onClick={() => removeSelectedExtraMember(item)}
                      className="min-sz-button px-2"
                      aria-label={`Remove ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <div className="filter-container-start pt-4">
            {hasPermissionToFilter && (
              <div className="filter-style margin-right">
                <span>Filter by Special Colors</span>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                >
                  {['purple', 'green', 'navy'].map(color => (
                    <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="switch-toggle-control">
                        <input
                          type="checkbox"
                          className="switch-toggle"
                          id={`modal-${color}-toggle`}
                          checked={state.selectedSpecialColors[color]}
                          onChange={e => handleSpecialColorToggleChange(color, e.target.checked)}
                        />
                        <label className="switch-toggle-label" htmlFor={`modal-${color}-toggle`}>
                          <span className="switch-toggle-inner" />
                          <span className="switch-toggle-switch" />
                        </label>
                      </div>
                      <span
                        style={{
                          marginLeft: '3px',
                          fontSize: 'inherit',
                          textTransform: 'capitalize',
                          whiteSpace: 'nowrap',
                          fontWeight: 'normal',
                        }}
                      >
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="filter-container-start pt-4">
            {(hasPermissionToFilter || hasPermission('highlightEligibleBios')) && (
              <div className="filter-style margin-right">
                <span>Filter by Bio Status</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    id="modal-bio-status-toggle"
                    checked={state.selectedBioStatus}
                    onChange={handleBioStatusToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="modal-bio-status-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className="filter-style margin-right">
                <span>Filter by Trophies</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    checked={state.selectedTrophies}
                    id="modal-trophy-toggle"
                    onChange={handleTrophyToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="modal-trophy-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
                  </label>
                </div>
              </div>
            )}
            {hasPermissionToFilter && (
              <div className="filter-style">
                <span>Filter by Over Hours</span>
                <div className="switch-toggle-control">
                  <input
                    type="checkbox"
                    className="switch-toggle"
                    checked={state.selectedOverTime}
                    id="modal-over-hours-toggle"
                    onChange={handleOverHoursToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="modal-over-hours-toggle">
                    <span className="switch-toggle-inner" />
                    <span className="switch-toggle-switch" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>
          Create
        </Button>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
export default CreateFilterModal;

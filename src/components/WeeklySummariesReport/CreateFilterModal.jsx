import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  Input,
  Form,
  Row,
  Col,
  FormGroup,
} from 'reactstrap';

import { MultiSelect } from 'react-multi-select-component';
import { ENDPOINTS } from 'utils/URL';
import Select from 'react-select';
import './CreateFilterModal.css';
import hasPermission from '../../utils/permissions';

const defaultState = {
  filterName: '',
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

function CreateFilterModal({
  isOpen,
  toggle,
  initialState,
  darkMode,
  hasPermissionToFilter,
  filters,
  refetchFilters,
}) {
  const [state, setState] = useState(() => initialState ?? defaultState);
  const [mode, setMode] = useState('create');
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  // Update members of membersFromUnselectedTeam dropdown
  useEffect(() => {
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
    setState(prev => ({
      ...prev,
      membersFromUnselectedTeam: newMembersFromUnselectedTeam,
      // Remove individuals that is in selected team
      selectedExtraMembers: state.selectedExtraMembers.filter(
        member => !selectedMemberSet.has(member.value),
      ),
    }));
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (state.filterName !== '') {
      if (mode === 'create' || (mode === 'update' && state.selectedFilter !== null)) {
        // No errors -> submit form
        const data = {
          filterName: state.filterName,
          selectedCodes: state.selectedCodes.map(code => code.value),
          selectedColors: state.selectedColors.map(color => color.value),
          selectedExtraMembers: state.selectedExtraMembers.map(member => member.value),
          selectedTrophies: state.selectedTrophies,
          selectedSpecialColors: state.selectedSpecialColors,
          selectedBioStatus: state.selectedBioStatus,
          selectedOverTime: state.selectedOverTime,
        };
        if (mode === 'create') {
          // eslint-disable-next-line no-console
          console.log(data);
          try {
            const res = await axios.post(ENDPOINTS.WEEKLY_SUMMARIES_FILTERS, data);
            if (res.status < 200 || res.status >= 300) {
              toast.error(`Failed to save new filter. Status ${res.status}`);
            } else {
              toast.success(`Successfully created filter ${state.filterName}`);
            }
            refetchFilters();
          } catch (error) {
            toast.error(`Failed to save new filter. Error ${error}`);
          }
        } else {
          try {
            const res = await axios.patch(
              ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(selectedFilter.value),
              data,
            );
            if (res.status < 200 || res.status >= 300) {
              toast.error(`Failed to save new filter. Status ${res.status}`);
            } else {
              toast.success(`Successfully update filter ${selectedFilter.label}`);
            }
            refetchFilters();
          } catch (error) {
            toast.error(`Failed to save new filter. Error ${error}`);
          }
        }

        // eslint-disable-next-line no-console
        console.log('Form submitted:', data);
        toggle();
      }
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} className="weekly-summaries-report">
      <ModalHeader toggle={toggle}>Create or Update A New Filter</ModalHeader>
      <ModalBody>
        <Form>
          <Input
            type="select"
            id="mode"
            className="mb-3"
            value={mode}
            onChange={e => setMode(e.target.value)}
            required
          >
            <option value="create">Create New</option>
            <option value="update">Update Existing Filter</option>
          </Input>

          {mode === 'update' && (
            <FormGroup>
              <Label for="filterOverride">Choose a Filter to Override *</Label>

              <Select
                id="filterOverride"
                options={filters}
                value={selectedFilter}
                onChange={setSelectedFilter}
                className={!selectedFilter ? 'error-select' : ''}
              />
              {!selectedFilter && <div className="error-text">Please select a filter</div>}
            </FormGroup>
          )}

          <FormGroup>
            <Label for="filterName">
              {mode === 'create' ? 'Filter Name *' : 'New Filter Name *'}
            </Label>
            <Input
              id="filterName"
              value={state.filterName}
              onChange={e => handleFilterNameChange(e.target.value)}
              placeholder="Enter filter name"
              required
              invalid={!state.filterName}
            />
            {state.filterName === '' && <div className="error-text">Filter name is required</div>}
          </FormGroup>

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
                options={state.membersFromUnselectedTeam}
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
                          id={`filter-modal-${color}-toggle`}
                          checked={state.selectedSpecialColors[color]}
                          onChange={e => handleSpecialColorToggleChange(color, e.target.checked)}
                        />
                        <label
                          className="switch-toggle-label"
                          htmlFor={`filter-modal-${color}-toggle`}
                        >
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
                    id="filter-modal-bio-status-toggle"
                    checked={state.selectedBioStatus}
                    onChange={handleBioStatusToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="filter-modal-bio-status-toggle">
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
                    id="filter-modal-trophy-toggle"
                    onChange={handleTrophyToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="filter-modal-trophy-toggle">
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
                    id="filter-modal-over-hours-toggle"
                    onChange={handleOverHoursToggleChange}
                  />
                  <label className="switch-toggle-label" htmlFor="filter-modal-over-hours-toggle">
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
          Save
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
export default CreateFilterModal;

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
  Spinner,
} from 'reactstrap';

import { MultiSelect } from 'react-multi-select-component';
import { ENDPOINTS } from 'utils/URL';
import Select from 'react-select';
import './CreateFilterModal.css';

const defaultState = {
  filterName: '',
  selectedCodes: [],
  teamCodeWarningUsers: [],
  colorOptions: [],
  selectedColors: [],
  selectedExtraMembers: [],
  selectedTrophies: false,
  selectedSpecialColors: {
    purple: false,
    green: false,
    navy: false,
  },
  selectedBioStatus: false,
  selectedOverTime: false,
  membersFromUnselectedTeam: [],
};

export default function UpdateFilterModal({
  isOpen,
  toggle,
  filters,
  darkMode,
  hasPermissionToFilter,
  canSeeBioHighlight,
  refetchFilters,
  teamCodes,
  colorOptions,
  tableData,
  summaries,
  teamCodeWarningUsers,
}) {
  const [state, setState] = useState(defaultState);
  const [update, setUpdate] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteToggle = () => setDeleteOpen(!deleteOpen);

  // Update members of membersFromUnselectedTeam dropdown
  useEffect(() => {
    // Add all selected member in a Set
    const selectedMemberSet = new Set();

    state.selectedCodes.forEach(code => {
      if (code.value === '') return;
      if (code.value in tableData) {
        const team = tableData[code.value];
        team.forEach(member => {
          selectedMemberSet.add(member._id);
        });
      }
    });

    // Filter members from unselected set
    const newMembersFromUnselectedTeam = [];
    summaries.forEach(summary => {
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
  }, [state.selectedCodes, summaries]);

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

  const handleSelectedFilter = e => {
    const filterChoice = e;
    setSelectedFilter(filterChoice);
    setUpdate(false);
    const filter = filterChoice.filterData;
    const selectedCodesChoice = teamCodes.filter(code => filter.selectedCodes.has(code.value));
    const selectedColorsChoice = colorOptions.filter(color =>
      filter.selectedColors.has(color.value),
    );
    const selectedExtraMembersChoice = state.membersFromUnselectedTeam.filter(member =>
      filter.selectedExtraMembers.has(member.value),
    );

    setState(prevState => ({
      ...prevState,
      filterName: filterChoice.label,
      selectedCodes: selectedCodesChoice,
      selectedColors: selectedColorsChoice,
      selectedExtraMembers: selectedExtraMembersChoice,
      selectedTrophies: filter.selectedTrophies,
      selectedSpecialColors: filter.selectedSpecialColors,
      selectedBioStatus: filter.selectedBioStatus,
      selectedOverTime: filter.selectedOverTime,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (state.filterName !== '' && state.filterName.length <= 7) {
      if (update && state.selectedFilter !== null) {
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
        toggle();
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.delete(ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(selectedFilter.value));
      if (res.status < 200 || res.status >= 300) {
        toast.error(`Failed to delete filter. Status ${res.status}`);
      } else {
        toast.success(`Successfully delete filter ${selectedFilter.label}`);
      }
      await refetchFilters();
    } catch (error) {
      toast.error(`Failed to delete filter. Error ${error}`);
    }
    setSelectedFilter(null);
    setIsDeleting(false);
    deleteToggle();
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} toggle={toggle} className="weekly-summaries-report">
        <ModalHeader toggle={toggle}>Create A New Filter or Override Existing Filter</ModalHeader>
        <ModalBody>
          <Form>
            <Label for="filterOverride">Select a Filter</Label>
            <Select
              id="filterOverride"
              options={filters}
              value={selectedFilter}
              onChange={e => handleSelectedFilter(e)}
              className={`top-select ${!selectedFilter ? 'error-select' : ''}`}
            />
            {selectedFilter && (
              <FormGroup>
                <div className="my-3">
                  <Button color="primary" className="mr-2">
                    Edit
                  </Button>
                  <Button color="danger" onClick={deleteToggle}>
                    Delete
                  </Button>
                </div>
                <Label for="filterName">Filter Name (up to 7 characters) *</Label>
                <Input
                  id="filterName"
                  value={state.filterName}
                  onChange={e => handleFilterNameChange(e.target.value)}
                  placeholder="Enter filter name"
                  required
                  invalid={!state.filterName}
                  maxLength={7}
                />
                {state.filterName === '' && (
                  <div className="error-text">Filter name is required</div>
                )}

                <Row className="pt-4">
                  <Col md={6} sm={12}>
                    <div>
                      <b>Select Team Code</b>
                    </div>
                    <MultiSelect
                      className={`report-multi-select-filter second-select text-dark ${
                        darkMode ? 'dark-mode' : ''
                      } ${teamCodeWarningUsers.length > 0 ? 'warning-border' : ''}`}
                      options={teamCodes.map(item => {
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
                      className={`report-multi-select-filter third-select text-dark ${
                        darkMode ? 'dark-mode' : ''
                      }`}
                      options={colorOptions}
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
                      className={`report-multi-select-filter text-dark ${
                        darkMode ? 'dark-mode' : ''
                      }`}
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '2px',
                        }}
                      >
                        {['purple', 'green', 'navy'].map(color => (
                          <div
                            key={`${color}-toggle`}
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <div className="switch-toggle-control">
                              <input
                                type="checkbox"
                                className="switch-toggle"
                                id={`filter-modal-${color}-toggle`}
                                checked={state.selectedSpecialColors[color]}
                                onChange={e =>
                                  handleSpecialColorToggleChange(color, e.target.checked)
                                }
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
                  {(hasPermissionToFilter || canSeeBioHighlight) && (
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
                        <label
                          className="switch-toggle-label"
                          htmlFor="filter-modal-bio-status-toggle"
                        >
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
                        <label
                          className="switch-toggle-label"
                          htmlFor="filter-modal-over-hours-toggle"
                        >
                          <span className="switch-toggle-inner" />
                          <span className="switch-toggle-switch" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </FormGroup>
            )}
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

      <Modal isOpen={deleteOpen} toggle={deleteToggle}>
        <ModalHeader toggle={deleteToggle}>Confirm Delete</ModalHeader>
        <ModalBody>
          {isDeleting ? (
            <div className="d-flex align-items-center">
              <Spinner size="sm" color="danger" className="mr-2" />
              Deleting...
            </div>
          ) : (
            `Are you sure you want to delete filter ${selectedFilter ? selectedFilter.label : ''}?`
          )}
        </ModalBody>
        <ModalFooter>
          {!isDeleting && (
            <>
              <Button color="secondary" onClick={deleteToggle}>
                Cancel
              </Button>
              <Button color="danger" onClick={handleDelete}>
                Yes, Delete
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

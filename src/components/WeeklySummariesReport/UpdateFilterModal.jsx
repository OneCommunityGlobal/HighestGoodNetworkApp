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
import { ENDPOINTS } from '~/utils/URL';
import Select from 'react-select';
import mainStyles from './WeeklySummariesReport.module.css';
import { setField, toggleField, removeItemFromField, setChildField } from '~/utils/stateHelper';

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
  selectedCodesInvalid: [],
  selectedColorsInvalid: [],
  selectedExtraMembersInvalid: [],
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
  memberDict,
}) {
  const [state, setState] = useState(defaultState);
  const [update, setUpdate] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const deleteModalToggle = () => setDeleteModalOpen(!deleteModalOpen);

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(null); // reset state whenever modal opens
    }
  }, [isOpen]);

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
    setField(setState, 'filterName', value);
  };

  const handleSelectCodesChange = event => {
    setField(setState, 'selectedCodes', event);
  };

  const removeSelectedCode = removeCode => {
    removeItemFromField(setState, 'selectedCodes', removeCode);
  };

  const removeInvalidSelectedCode = removeCode => {
    removeItemFromField(setState, 'selectedCodesInvalid', removeCode);
  };

  const removeInvalidSelectedColor = removeCode => {
    removeItemFromField(setState, 'selectedColorsInvalid', removeCode);
  };

  const removeInvalidSelectedExtraMember = removeCode => {
    removeItemFromField(setState, 'selectedExtraMembersInvalid', removeCode);
  };

  const handleSelectColorChange = event => {
    setField(setState, 'selectedColors', event);
  };
  const removeSelectedColor = removeColor => {
    removeItemFromField(setState, 'selectedColors', removeColor);
  };

  const handleSelectExtraMembersChange = event => {
    setField(setState, 'selectedExtraMembers', event);
  };

  const removeSelectedExtraMember = removeMember => {
    removeItemFromField(setState, 'selectedExtraMembers', removeMember);
  };

  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleSpecialColorToggleChange = (color, isEnabled) => {
    setChildField(setState, 'selectedSpecialColors', color, isEnabled);
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  const handleSelectedFilter = e => {
    const filterChoice = e;
    setSelectedFilter(filterChoice);
    setUpdate(false);
    const filter = filterChoice.filterData;
    const selectedCodesChoice = teamCodes
      .filter(code => filter.selectedCodes.has(code.value))
      .map(item => {
        const [code, count] = item.label.split(' (');
        return {
          ...item,
          label: `${code.padEnd(10, ' ')} (${count}`,
        };
      });
    const selectedCodesSet = new Set(selectedCodesChoice.map(item => item.value));

    const selectedCodesInvalidChoice = [...filter.selectedCodes]
      .filter(item => !selectedCodesSet.has(item))
      .map(item => {
        return {
          label: `${item.padEnd(10, ' ')} (0)`,
          value: item,
          _ids: [],
        };
      });

    const selectedColorsChoice = colorOptions.filter(color =>
      filter.selectedColors.has(color.value),
    );
    const selectedColorsSet = new Set(selectedColorsChoice.map(item => item.value));
    const selectedColorsInvalidChoice = [...filter.selectedColors]
      .filter(item => !selectedColorsSet.has(item))
      .map(item => {
        return {
          label: item,
          value: item,
        };
      });

    const selectedExtraMembersChoice = summaries
      .filter(summary => filter.selectedExtraMembers.has(summary._id))
      .map(summary => ({
        label: `${summary.firstName} ${summary.lastName}`,
        value: summary._id,
        role: summary.role,
      }));

    const selectedExtraMembersSet = new Set(selectedExtraMembersChoice.map(item => item.value));
    const selectedExtraMembersInvalidChoice = [...filter.selectedExtraMembers]
      .filter(item => !selectedExtraMembersSet.has(item))
      .map(item => {
        return {
          label: item in memberDict ? memberDict[item] : 'N/A',
          value: item,
          role: '',
        };
      });

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
      selectedCodesInvalid: selectedCodesInvalidChoice,
      selectedColorsInvalid: selectedColorsInvalidChoice,
      selectedExtraMembersInvalid: selectedExtraMembersInvalidChoice,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (state.filterName !== '' && state.filterName.length <= 7) {
      if (update && state.selectedFilter !== null) {
        setIsProcessing(true);
        // No errors -> submit form
        const data = {
          filterName: state.filterName,
          selectedCodes: [...state.selectedCodes, ...state.selectedCodesInvalid].map(
            code => code.value,
          ),
          selectedColors: [...state.selectedColors, ...state.selectedColorsInvalid].map(
            color => color.value,
          ),
          selectedExtraMembers: [
            ...state.selectedExtraMembers,
            ...state.selectedExtraMembersInvalid,
          ].map(member => member.value),
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
          await refetchFilters();
        } catch (error) {
          toast.error(`Failed to save new filter. Error ${error}`);
        }
        setSelectedFilter(prev => ({
          ...prev,
          label: state.filterName,
        }));
        setIsProcessing(false);
        setUpdate(false);
      } else {
        toast.error('Please select a filter!');
      }
    } else {
      toast.error(`Invalid filter name! Filter name must be from 1-7 characters.`);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
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
    setIsProcessing(false);
    deleteModalToggle();
  };

  const rollBackUpdate = () => {
    setUpdate(false);
    const filter = selectedFilter.filterData;
    const selectedCodesChoice = teamCodes
      .filter(code => filter.selectedCodes.has(code.value))
      .map(item => {
        const [code, count] = item.label.split(' (');
        return {
          ...item,
          label: `${code.padEnd(10, ' ')} (${count}`,
        };
      });

    const selectedCodesSet = new Set(selectedCodesChoice.map(item => item.value));

    const selectedCodesInvalidChoice = [...filter.selectedCodes]
      .filter(item => !selectedCodesSet.has(item))
      .map(item => {
        return {
          label: `${item.padEnd(10, ' ')} (0)`,
          value: item,
          _ids: [],
        };
      });
    const selectedColorsChoice = colorOptions.filter(color =>
      filter.selectedColors.has(color.value),
    );
    const selectedExtraMembersChoice = summaries
      .filter(summary => filter.selectedExtraMembers.has(summary._id))
      .map(summary => ({
        label: `${summary.firstName} ${summary.lastName}`,
        value: summary._id,
        role: summary.role,
      }));

    setState(prevState => ({
      ...prevState,
      filterName: selectedFilter.label,
      selectedCodes: selectedCodesChoice,
      selectedColors: selectedColorsChoice,
      selectedExtraMembers: selectedExtraMembersChoice,
      selectedTrophies: filter.selectedTrophies,
      selectedSpecialColors: filter.selectedSpecialColors,
      selectedBioStatus: filter.selectedBioStatus,
      selectedOverTime: filter.selectedOverTime,
      selectedCodesInvalid: selectedCodesInvalidChoice,
    }));
  };

  return (
    <>
      <Modal
        size="lg"
        isOpen={isOpen}
        toggle={toggle}
        className={`${darkMode ? mainStyles.darkModal : ''}`}
      >
        <ModalHeader toggle={toggle}>Update or Delete Filter</ModalHeader>
        <ModalBody>
          <Form>
            <Label for="filterOverride" className={`${darkMode ? mainStyles.textWhite : ''}`}>
              Select a Filter
            </Label>
            <Select
              id="filterOverride"
              options={filters}
              value={selectedFilter}
              onChange={e => handleSelectedFilter(e)}
              className={`top-select ${mainStyles.textDark} ${
                !selectedFilter ? `${mainStyles.errorSelect}` : ''
              }`}
            />
            {selectedFilter && (
              <FormGroup>
                {update ? (
                  <div>
                    {isProcessing ? (
                      <div className="d-flex align-items-center">
                        <Spinner size="sm" color="danger" className="mr-2" />
                        Updating...
                      </div>
                    ) : (
                      <div className="my-3 d-flex justify-content-end">
                        <Button color="primary" className="mr-2" onClick={handleSubmit}>
                          Save
                        </Button>
                        <Button color="secondary" onClick={rollBackUpdate}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="my-3 d-flex justify-content-end">
                    <Button color="primary" className="mr-2" onClick={setUpdate}>
                      Edit
                    </Button>
                    <Button color="danger" onClick={deleteModalToggle}>
                      Delete
                    </Button>
                  </div>
                )}
                <Label for="filterName" className={`${darkMode ? mainStyles.textWhite : ''}`}>
                  Filter Name (up to 7 characters) *
                </Label>
                <Input
                  id="filterName"
                  value={state.filterName}
                  onChange={e => handleFilterNameChange(e.target.value)}
                  placeholder="Enter filter name"
                  required
                  invalid={!state.filterName}
                  maxLength={7}
                  disabled={!update}
                />
                {state.filterName === '' && (
                  <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
                    Filter name is required
                  </div>
                )}

                <Row className="pt-4">
                  {update && (
                    <Col md={6} sm={12}>
                      <div>
                        <b>Select Team Code</b>
                      </div>
                      <MultiSelect
                        className={`${mainStyles['report-multi-select-filter']} second-select ${
                          mainStyles.textDark
                        } ${darkMode ? 'dark-mode' : ''} ${
                          teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
                        }`}
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
                  )}
                  <Col md={update ? 6 : 12} sm={12}>
                    <div>Selected Team Code</div>
                    <div className={`${mainStyles.smScrollable}`}>
                      {state.selectedCodes.map(item => (
                        <div
                          key={item.value}
                          className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeSelectedCode(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                      {state.selectedCodesInvalid.map(item => (
                        <div
                          key={item.value}
                          className={`${darkMode ? mainStyles.redChip : ''} ${
                            mainStyles.invalidChip
                          }`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeInvalidSelectedCode(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {state.selectedCodesInvalid.length > 0 && (
                      <div
                        className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}
                      >
                        ** The team code in pink is the team code that no longer have any members
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="pt-4">
                  {update && (
                    <Col md={6} sm={12}>
                      <div>
                        <b>Select Color</b>
                      </div>
                      <MultiSelect
                        className={`${mainStyles['report-multi-select-filter']} third-select ${
                          mainStyles.textDark
                        } ${darkMode ? 'dark-mode' : ''}`}
                        options={colorOptions}
                        value={state.selectedColors}
                        onChange={handleSelectColorChange}
                      />
                    </Col>
                  )}
                  <Col md={update ? 6 : 12} sm={12}>
                    <div>Selected Colors</div>
                    <div className={`${mainStyles.smScrollable}`}>
                      {state.selectedColors.map(item => (
                        <div
                          key={item.value}
                          className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeSelectedColor(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                      {state.selectedColorsInvalid.map(item => (
                        <div
                          key={item.value}
                          className={`${darkMode ? mainStyles.redChip : ''} ${
                            mainStyles.invalidChip
                          }`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeInvalidSelectedColor(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {state.selectedColorsInvalid.length > 0 && (
                      <div
                        className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}
                      >
                        ** The colors in pink are the colors that no longer have any members
                      </div>
                    )}
                  </Col>
                </Row>
                <Row className="pt-4">
                  {update && (
                    <Col md={6} sm={12}>
                      <div>
                        <b>Select Extra Members</b>
                      </div>
                      <MultiSelect
                        className={`${mainStyles['report-multi-select-filter']} ${
                          mainStyles.textDark
                        } ${darkMode ? 'dark-mode' : ''}`}
                        options={state.membersFromUnselectedTeam}
                        value={state.selectedExtraMembers}
                        onChange={handleSelectExtraMembersChange}
                      />
                    </Col>
                  )}
                  <Col md={update ? 6 : 12} sm={12}>
                    <div>Selected Extra Members</div>
                    <div className={`${mainStyles.smScrollable}`}>
                      {state.selectedExtraMembers.map(item => (
                        <div
                          key={item.value}
                          className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeSelectedExtraMember(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                      {state.selectedExtraMembersInvalid.map(item => (
                        <div
                          key={item.value}
                          className={`${darkMode ? mainStyles.redChip : ''} ${
                            mainStyles.invalidChip
                          }`}
                        >
                          {item.label}
                          {update && (
                            <Button
                              close
                              onClick={() => removeInvalidSelectedExtraMember(item)}
                              className={`${mainStyles.minSzButton} px-2`}
                              aria-label={`Remove ${item.label}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {state.selectedExtraMembersInvalid.length > 0 && (
                      <div
                        className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}
                      >
                        ** The members in pink is the members that cannot be found in the dropdown.
                        They might be inactive, deleted or in a selected team code.
                      </div>
                    )}
                  </Col>
                </Row>
                <div className={`${mainStyles.filterContainer} pt-4`}>
                  {hasPermissionToFilter && (
                    <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
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
                            <div className={`${mainStyles.switchToggleControl}`}>
                              <input
                                type="checkbox"
                                className={`${mainStyles.switchToggle}`}
                                id={`filter-modal-${color}-toggle`}
                                checked={state.selectedSpecialColors[color]}
                                disabled={!update}
                                onChange={e =>
                                  handleSpecialColorToggleChange(color, e.target.checked)
                                }
                              />
                              <Label
                                className={`${mainStyles.switchToggleLabel}`}
                                for={`filter-modal-${color}-toggle`}
                              >
                                <span className={`${mainStyles.switchToggleInner}`} />
                                <span className={`${mainStyles.switchToggleSwitch}`} />
                              </Label>
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
                <div className={`${mainStyles.filterContainer} pt-4`}>
                  {(hasPermissionToFilter || canSeeBioHighlight) && (
                    <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                      <span>Filter by Bio Status</span>
                      <div className={`${mainStyles.switchToggleControl}`}>
                        <input
                          type="checkbox"
                          className={`${mainStyles.switchToggle}`}
                          id="filter-modal-bio-status-toggle"
                          checked={state.selectedBioStatus}
                          disabled={!update}
                          onChange={handleBioStatusToggleChange}
                        />
                        <Label
                          className={`${mainStyles.switchToggleLabel}`}
                          for="filter-modal-bio-status-toggle"
                        >
                          <span className={`${mainStyles.switchToggleInner}`} />
                          <span className={`${mainStyles.switchToggleSwitch}`} />
                        </Label>
                      </div>
                    </div>
                  )}
                  {hasPermissionToFilter && (
                    <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                      <span>Filter by Trophies</span>
                      <div className={`${mainStyles.switchToggleControl}`}>
                        <input
                          type="checkbox"
                          className={`${mainStyles.switchToggle}`}
                          checked={state.selectedTrophies}
                          id="filter-modal-trophy-toggle"
                          onChange={handleTrophyToggleChange}
                          disabled={!update}
                        />
                        <Label
                          className={`${mainStyles.switchToggleLabel}`}
                          for="filter-modal-trophy-toggle"
                        >
                          <span className={`${mainStyles.switchToggleInner}`} />
                          <span className={`${mainStyles.switchToggleSwitch}`} />
                        </Label>
                      </div>
                    </div>
                  )}
                  {hasPermissionToFilter && (
                    <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                      <span>Filter by Over Hours</span>
                      <div className={`${mainStyles.switchToggleControl}`}>
                        <input
                          type="checkbox"
                          className={`${mainStyles.switchToggle}`}
                          checked={state.selectedOverTime}
                          id="filter-modal-over-hours-toggle"
                          onChange={handleOverHoursToggleChange}
                          disabled={!update}
                        />
                        <Label
                          className={`${mainStyles.switchToggleLabel}`}
                          for="filter-modal-over-hours-toggle"
                        >
                          <span className={`${mainStyles.switchToggleInner}`} />
                          <span className={`${mainStyles.switchToggleSwitch}`} />
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        toggle={deleteModalToggle}
        className={`${darkMode ? mainStyles.darkModal : ''}`}
      >
        <ModalHeader toggle={deleteModalToggle}>Confirm Delete</ModalHeader>
        <ModalBody>
          {isProcessing ? (
            <div className="d-flex align-items-center">
              <Spinner size="sm" color="danger" className="mr-2" />
              Deleting...
            </div>
          ) : (
            `Are you sure you want to delete filter ${selectedFilter ? selectedFilter.label : ''}?`
          )}
        </ModalBody>
        <ModalFooter>
          {!isProcessing && (
            <>
              <Button color="secondary" onClick={deleteModalToggle}>
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

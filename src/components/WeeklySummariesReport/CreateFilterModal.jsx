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
import { ENDPOINTS } from '~/utils/URL';
import Select from 'react-select';
import mainStyles from './WeeklySummariesReport.module.css';
import { setField, toggleField, removeItemFromField, setChildField } from '~/utils/stateHelper';

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
  canSeeBioHighlight,
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

  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (state.filterName !== '' && state.filterName.length <= 7) {
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
            await refetchFilters();
          } catch (error) {
            toast.error(`Failed to save new filter. Error ${error}`);
          }
        }

        toggle();
      }
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      toggle={toggle}
      className={`${darkMode ? mainStyles.darkModal : ''}`}
    >
      <ModalHeader toggle={toggle}>Create A New Filter or Override Existing Filter</ModalHeader>
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
            <option value="update">Override Existing Filter</option>
          </Input>
          {mode === 'update' && (
            <FormGroup>
              <Label for="filterOverride" className={`${darkMode ? mainStyles.textWhite : ''}`}>
                Choose a Filter to Override *
              </Label>

              <Select
                id="filterOverride"
                options={filters}
                value={selectedFilter}
                onChange={setSelectedFilter}
                className={`${mainStyles.textDark} ${
                  !selectedFilter ? `${mainStyles.errorSelect}` : ''
                }`}
              />
              {!selectedFilter && (
                <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
                  Please select a filter
                </div>
              )}
            </FormGroup>
          )}
          <FormGroup>
            <Label for="filterName" className={`${darkMode ? mainStyles.textWhite : ''}`}>
              {mode === 'create'
                ? 'Filter Name (up to 7 characters) *'
                : 'New Filter Name (up to 7 characters) *'}
            </Label>
            <Input
              id="filterName"
              value={state.filterName}
              onChange={e => setField(setState, 'filterName', e.target.value)}
              placeholder="Enter filter name"
              required
              invalid={!state.filterName}
              maxLength={7}
            />
            {state.filterName === '' && (
              <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
                Filter name is required
              </div>
            )}
          </FormGroup>
          <Row className="pt-4">
            <Col md={6} sm={12}>
              <div>
                <b>Select Team Code</b>
              </div>
              <MultiSelect
                className={`top-select ${mainStyles['report-multi-select-filter']} ${
                  mainStyles.textDark
                } 
                  ${darkMode ? 'dark-mode' : ''} ${
                  state.teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
                }`}
                options={state.teamCodes.map(item => {
                  const [code, count] = item.label.split(' (');
                  return {
                    ...item,
                    label: `${code.padEnd(10, ' ')} (${count}`,
                  };
                })}
                value={state.selectedCodes}
                onChange={e => setField(setState, 'selectedCodes', e)}
                labelledBy="Select"
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Team Code</div>
              <div className={`${mainStyles.smScrollable}`}>
                {state.selectedCodes.map(item => (
                  <div
                    key={item.value}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item.label}
                    <Button
                      close
                      onClick={() => removeItemFromField(setState, 'selectedCodes', item)}
                      className={`${mainStyles.minSzButton} px-2`}
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
                className={`report-multi-select-filter second-select ${mainStyles.textDark} ${
                  darkMode ? 'dark-mode' : ''
                }`}
                options={state.colorOptions}
                value={state.selectedColors}
                onChange={e => setField(setState, 'selectedColors', e)}
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Colors</div>
              <div className={`${mainStyles.smScrollable}`}>
                {state.selectedColors.map(item => (
                  <div
                    key={item.value}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item.label}
                    <Button
                      close
                      onClick={() => removeItemFromField(setState, 'selectedColors', item)}
                      className={`${mainStyles.minSzButton} px-2`}
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
                className={`report-multi-select-filter ${mainStyles.textDark} ${
                  darkMode ? 'dark-mode' : ''
                }`}
                options={state.membersFromUnselectedTeam}
                value={state.selectedExtraMembers}
                onChange={e => setField(setState, 'selectedExtraMembers', e)}
              />
            </Col>
            <Col md={6} sm={12}>
              <div>Selected Extra Members</div>
              <div className={`${mainStyles.smScrollable}`}>
                {state.selectedExtraMembers.map(item => (
                  <div
                    key={item.value}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item.label}
                    <Button
                      close
                      onClick={() => removeItemFromField(setState, 'selectedExtraMembers', item)}
                      className={`${mainStyles.minSzButton} px-2`}
                      aria-label={`Remove ${item.label}`}
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <div className={`${mainStyles.filterContainer} pt-4`}>
            {hasPermissionToFilter && (
              <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                <span>Filter by Special Colors</span>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                >
                  {['purple', 'green', 'navy'].map(color => (
                    <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className={`${mainStyles.switchToggleControl}`}>
                        <input
                          type="checkbox"
                          className={`${mainStyles.switchToggle}`}
                          id={`filter-modal-${color}-toggle`}
                          checked={state.selectedSpecialColors[color]}
                          onChange={e =>
                            setChildField(
                              setState,
                              'selectedSpecialColors',
                              color,
                              e.target.checked,
                            )
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

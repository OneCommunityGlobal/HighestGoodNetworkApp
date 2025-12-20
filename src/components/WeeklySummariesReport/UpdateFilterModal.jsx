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
  FormGroup,
  Spinner,
} from 'reactstrap';

import { ENDPOINTS } from '~/utils/URL';
import Select from 'react-select';
import mainStyles from './WeeklySummariesReport.module.css';
import { setField } from '~/utils/stateHelper';
import FilterPreviewForm from './FilterPreviewForm';
import FilterEditForm from './FilterEditForm';

const ActionButtons = ({ update, isProcessing, onSave, onCancel, onEdit, onDelete }) => {
  if (update) {
    if (isProcessing) {
      return (
        <div className="d-flex align-items-center">
          <Spinner size="sm" color="danger" className="mr-2" />
          Updating...
        </div>
      );
    }

    return (
      <div className="my-3 d-flex justify-content-end">
        <Button color="primary" className="mr-2" onClick={onSave}>
          Save
        </Button>
        <Button color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="my-3 d-flex justify-content-end">
      <Button color="primary" className="mr-2" onClick={onEdit}>
        Edit
      </Button>
      <Button color="danger" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
};


const defaultState = {
  filterName: '',
  selectedCodes: [],
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

const mapSelectedCodes = (filter, teamCodes) => {
  const selected = teamCodes
    .filter(code => filter.selectedCodes.has(code.value))
    .map(item => {
      const [code, count] = item.label.split(' (');
      return { ...item, label: `${code.padEnd(10, ' ')} (${count}` };
    });

  const selectedSet = new Set(selected.map(item => item.value));

  const invalid = [...filter.selectedCodes]
    .filter(item => !selectedSet.has(item))
    .map(item => ({
      label: `${item.padEnd(10, ' ')} (0)`,
      value: item,
      _ids: [],
    }));

  return { selected, invalid };
};

const mapSelectedColors = (filter, colorOptions) => {
  const selected = colorOptions.filter(color => filter.selectedColors.has(color.value));

  const selectedSet = new Set(selected.map(item => item.value));

  const invalid = [...filter.selectedColors]
    .filter(item => !selectedSet.has(item))
    .map(item => ({ label: item, value: item }));

  return { selected, invalid };
};

const mapSelectedMembers = (filter, summaries, memberDict) => {
  const selected = summaries
    .filter(summary => filter.selectedExtraMembers.has(summary._id))
    .map(summary => ({
      label: `${summary.firstName} ${summary.lastName}`,
      value: summary._id,
      role: summary.role,
    }));

  const selectedSet = new Set(selected.map(item => item.value));

  const invalid = [...filter.selectedExtraMembers]
    .filter(item => !selectedSet.has(item))
    .map(item => ({
      label: item in memberDict ? memberDict[item] : 'N/A',
      value: item,
      role: '',
    }));

  return { selected, invalid };
};

const isValidFilterName = name => name !== '' && name.length <= 7;

const buildUpdatePayload = state => ({
  filterName: state.filterName,
  selectedCodes: [...state.selectedCodes, ...state.selectedCodesInvalid].map(code => code.value),
  selectedColors: [...state.selectedColors, ...state.selectedColorsInvalid].map(
    color => color.value,
  ),
  selectedExtraMembers: [...state.selectedExtraMembers, ...state.selectedExtraMembersInvalid].map(
    member => member.value,
  ),
  selectedTrophies: state.selectedTrophies,
  selectedSpecialColors: state.selectedSpecialColors,
  selectedBioStatus: state.selectedBioStatus,
  selectedOverTime: state.selectedOverTime,
});

const updateFilterApi = async (filterId, payload) => {
  const res = await axios.patch(ENDPOINTS.WEEKLY_SUMMARIES_FILTER_BY_ID(filterId), payload);

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Status ${res.status}`);
  }
};

const updateLocalSelectedFilter = (setSelectedFilter, prev, payload) => {
  setSelectedFilter({
    ...prev,
    label: payload.filterName,
    filterData: {
      filterName: payload.filterName,
      selectedCodes: new Set(payload.selectedCodes),
      selectedColors: new Set(payload.selectedColors),
      selectedExtraMembers: new Set(payload.selectedExtraMembers),
      selectedTrophies: payload.selectedTrophies,
      selectedSpecialColors: payload.selectedSpecialColors,
      selectedBioStatus: payload.selectedBioStatus,
      selectedOverTime: payload.selectedOverTime,
    },
  });
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

  const focusedOptionBg = darkMode ? '#16233a' : '#eee';
  const normalOptionBg = darkMode ? '#0b1422' : '#ffffff';
  const optionTextColor = darkMode ? '#f5f7fb' : '#111827';

  const inputBackgroundColor = update ? '#0b1422' : '#1f2937';

  const darkInputStyle = {
    backgroundColor: inputBackgroundColor,
    color: '#f5f7fb',
    borderColor: '#334155',
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(null); // reset state whenever modal opens
    }
  }, [isOpen]);

  const handleFilterNameChange = value => {
    setField(setState, 'filterName', value);
  };

  const handleSelectedFilter = filterChoice => {
    setSelectedFilter(filterChoice);
    setUpdate(false);

    const filter = filterChoice.filterData;

    const { selected: selectedCodes, invalid: selectedCodesInvalid } = mapSelectedCodes(
      filter,
      teamCodes,
    );

    const { selected: selectedColors, invalid: selectedColorsInvalid } = mapSelectedColors(
      filter,
      colorOptions,
    );

    const {
      selected: selectedExtraMembers,
      invalid: selectedExtraMembersInvalid,
    } = mapSelectedMembers(filter, summaries, memberDict);

    setState(prev => ({
      ...prev,
      filterName: filterChoice.label,
      selectedCodes,
      selectedColors,
      selectedExtraMembers,
      selectedTrophies: filter.selectedTrophies,
      selectedSpecialColors: filter.selectedSpecialColors,
      selectedBioStatus: filter.selectedBioStatus,
      selectedOverTime: filter.selectedOverTime,
      selectedCodesInvalid,
      selectedColorsInvalid,
      selectedExtraMembersInvalid,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!isValidFilterName(state.filterName)) {
      toast.error('Invalid filter name! Filter name must be from 1-7 characters.');
      return;
    }

    if (!update || !selectedFilter) {
      toast.error('Please select a filter!');
      return;
    }

    setIsProcessing(true);

    const payload = buildUpdatePayload(state);

    try {
      await updateFilterApi(selectedFilter.value, payload);
      toast.success(`Successfully update filter ${selectedFilter.label}`);
      await refetchFilters();

      updateLocalSelectedFilter(setSelectedFilter, selectedFilter, payload);

      setUpdate(false);
    } catch (error) {
      toast.error(`Failed to save new filter. Error ${error}`);
    } finally {
      setIsProcessing(false);
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
        contentClassName={darkMode ? mainStyles.darkModal : ''}
      >
        <ModalHeader
          toggle={toggle}
          style={
            darkMode
              ? {
                  backgroundColor: '#16233a',
                  color: '#f5f7fb',
                  borderBottom: '1px solid #334155',
                }
              : {}
          }
        >
          Update or Delete Filter
        </ModalHeader>
        <ModalBody
          style={
            darkMode
              ? {
                  backgroundColor: '#0f1b2b',
                  color: '#f5f7fb',
                }
              : {}
          }
        >
          <Form>
            <Label for="filterOverride" className={`${darkMode ? mainStyles.textWhite : ''}`}>
              Select a Filter
            </Label>
            <Select
              id="filterOverride"
              options={filters}
              value={selectedFilter}
              onChange={handleSelectedFilter}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),

                control: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#0b1422' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#ced4da',
                  color: darkMode ? '#f5f7fb' : '#111827',
                  boxShadow: 'none',
                }),

                menu: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#0b1422' : '#ffffff',
                }),

                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? focusedOptionBg : normalOptionBg,
                  color: optionTextColor,
                }),

                singleValue: base => ({
                  ...base,
                  color: darkMode ? '#f5f7fb' : '#111827',
                }),

                placeholder: base => ({
                  ...base,
                  color: darkMode ? '#94a3b8' : '#6b7280',
                }),
              }}
            />
            {selectedFilter && (
              <FormGroup>
                <ActionButtons
                  update={update}
                  isProcessing={isProcessing}
                  onSave={handleSubmit}
                  onCancel={rollBackUpdate}
                  onEdit={() => setUpdate(true)}
                  onDelete={deleteModalToggle}
                />

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
                  style={darkMode ? darkInputStyle : {}}
                />
                {state.filterName === '' && (
                  <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
                    Filter name is required
                  </div>
                )}

                {update ? (
                  <FilterEditForm
                    state={state}
                    setState={setState}
                    darkMode={darkMode}
                    hasPermissionToFilter={hasPermissionToFilter}
                    canSeeBioHighlight={canSeeBioHighlight}
                    teamCodes={teamCodes}
                    colorOptions={colorOptions}
                    tableData={tableData}
               summaries={summaries}
                    teamCodeWarningUsers={teamCodeWarningUsers}
                  />
                ) : (
                  <FilterPreviewForm
                    selectedFilter={selectedFilter}
                    darkMode={darkMode}
                    memberDict={memberDict}
                  />
                )}
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter
          style={
            darkMode
              ? {
                  backgroundColor: '#16233a',
                  borderTop: '1px solid #334155',
                }
              : {}
          }
        >
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

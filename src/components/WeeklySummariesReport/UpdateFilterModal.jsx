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

  const handleFilterNameChange = value => {
    setField(setState, 'filterName', value);
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
          label: data.filterName,
          filterData: {
            filterName: data.filterName,
            selectedCodes: new Set(data.selectedCodes),
            selectedColors: new Set(data.selectedColors),
            selectedExtraMembers: new Set(data.selectedExtraMembers),
            selectedTrophies: data.selectedTrophies,
            selectedSpecialColors: data.selectedSpecialColors,
            selectedBioStatus: data.selectedBioStatus,
            selectedOverTime: data.selectedOverTime,
          },
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

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
import mainStyles from '../WeeklySummariesReport.module.css';
import { setField } from '~/utils/stateHelper';
import FilterPreviewForm from './FilterPreviewForm';
import FilterEditForm from './FilterEditForm';
import DeleteFilterConfirmationModal from './DeleteFilterConfirmationModal';
import {
  useDeleteWeeklySummariesFilterMutation,
  useUpdateWeeklySummariesFilterMutation,
} from '../../../actions/weeklySummariesFilterAction';
import { normalizeFilter } from '~/utils/weeklySummariesFilterHelper';

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

const modalDarkSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: state.isFocused ? '#4dabf7' : '#3a506b',
    boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(77,171,247,.25)' : 'none',
    outline: 'none',
    ':hover': {
      borderColor: '#4dabf7',
    },
  }),

  valueContainer: base => ({
    ...base,
    color: '#ffffff',
  }),

  singleValue: base => ({
    ...base,
    color: '#ffffff',
  }),

  input: base => ({
    ...base,
    color: '#ffffff',

    /* 🔥 REAL FIX */
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    background: 'transparent',

    /* prevent phantom left line */
    paddingLeft: 0,
    marginLeft: 0,
  }),

  placeholder: base => ({
    ...base,
    color: '#94a3b8',
  }),

  menu: base => ({
    ...base,
    backgroundColor: '#0f172a',
    zIndex: 9999,
  }),

  menuList: base => ({
    ...base,
    backgroundColor: '#0f172a',
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#334155' : state.isFocused ? '#243b55' : '#0f172a',
    color: '#ffffff',
  }),
};

export default function UpdateFilterModal({
  isOpen,
  toggle,
  filters,
  darkMode,
  hasPermissionToFilter,
  canSeeBioHighlight,
  teamCodes,
  colorOptions,
  tableData,
  summaries,
  teamCodeWarningUsers,
  memberDict,
  currentAppliedFilter,
  applyFilter,
}) {
  const [state, setState] = useState(defaultState);
  const [update, setUpdate] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [updateFilter] = useUpdateWeeklySummariesFilterMutation();
  const [deleteFilter] = useDeleteWeeklySummariesFilterMutation();

  const deleteModalToggle = () => setDeleteModalOpen(!deleteModalOpen);

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(null); // reset state whenever modal opens
    }
  }, [isOpen]);

  const customStyles = {
    control: base => ({
      ...base,
      backgroundColor: darkMode ? '#2e3440' : '#fff',
      borderColor: darkMode ? '#4c566a' : '#ccc',
      color: darkMode ? '#fff' : '#000',
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#2e3440' : '#fff',
      zIndex: 9999,
    }),
    menuList: base => ({
      ...base,
      backgroundColor: darkMode ? '#2e3440' : '#fff',
    }),
    option: (base, selectState) => {
      // Fixed: Extracted nested ternary into independent statements
      let backgroundColor;
      if (selectState.isFocused) {
        backgroundColor = darkMode ? '#434c5e' : '#eee';
      } else {
        backgroundColor = darkMode ? '#2e3440' : '#fff';
      }

      return {
        ...base,
        backgroundColor,
        color: darkMode ? '#fff' : '#000',
        cursor: 'pointer',
      };
    },
    singleValue: base => ({
      ...base,
      color: darkMode ? '#fff' : '#000',
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#fff' : '#000',
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#d8dee9' : '#808080',
    }),
  };

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
          const res = await updateFilter({
            id: selectedFilter.value,
            data,
          }).unwrap(); // unwrap = throw exception if error

          toast.success(`Successfully updated filter ${selectedFilter.label}`);
          if (currentAppliedFilter && selectedFilter.value === currentAppliedFilter.value) {
            applyFilter(normalizeFilter(res));
          }
          setSelectedFilter(normalizeFilter(res));
        } catch (error) {
          toast.error(`Failed to save new filter. Error: ${error}`);
        }

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
      const res = await deleteFilter({
        id: selectedFilter.value,
      }).unwrap(); // unwrap = throw exception if error

      toast.success(`Successfully deleted filter ${selectedFilter.label}`);

      // refetch();
    } catch (error) {
      toast.error(`Failed to delete filter. Error: ${JSON.stringify(error)}`);
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
        contentClassName={darkMode ? mainStyles.wsrDarkModalContent : undefined}
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
              styles={customStyles}
              className={`top-select ${mainStyles.textDark} ${
                selectedFilter ? '' : `${mainStyles.errorSelect}`
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

      <DeleteFilterConfirmationModal
        deleteModalOpen={deleteModalOpen}
        deleteModalToggle={deleteModalToggle}
        selectedFilter={selectedFilter}
        handleDelete={handleDelete}
        isProcessing={isProcessing}
        darkMode={darkMode}
      />
    </>
  );
}

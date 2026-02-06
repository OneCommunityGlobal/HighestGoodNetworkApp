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
} from 'reactstrap';

import { ENDPOINTS } from '~/utils/URL';
import Select from 'react-select';
import mainStyles from '../WeeklySummariesReport.module.css';
import { setField } from '~/utils/stateHelper';
import FilterEditForm from './FilterEditForm';
import {
  useCreateWeeklySummariesFilterMutation,
  useUpdateWeeklySummariesFilterMutation,
} from '../../../actions/weeklySummariesFilterAction';
import { normalizeFilter } from '~/utils/weeklySummariesFilterHelper';
import { da } from 'date-fns/locale';

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
};

const baseSelectStyles = {
  menu: base => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: base => ({
    ...base,
    maxHeight: '700px',
    overflowY: 'auto',
  }),
};

const darkSelectStyles = {
  ...baseSelectStyles,
  control: base => ({
    ...base,
    backgroundColor: '#1b2a41', // This stays for the main box background
    color: '#fff',
    borderColor: '#3a506b',
  }),
  valueContainer: base => ({
    ...base,
    paddingLeft: '12px', // FIX: Prevents "S" clipping
  }),
  singleValue: base => ({
    ...base,
    color: '#fff',
  }),
  menu: base => ({
    ...base,
    backgroundColor: '#1b2a41',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#243b55' : '#1b2a41',
    color: '#fff',
  }),
};

const lightSelectStyles = {
  ...baseSelectStyles,
  control: base => ({
    ...base,
    backgroundColor: '#fff',
    borderColor: '#ced4da',
  }),
  valueContainer: base => ({
    ...base,
    paddingLeft: '12px', // FIX: Prevents "S" clipping
  }),
};

function CreateFilterModal({
  isOpen,
  toggle,
  initialState,
  darkMode,
  hasPermissionToFilter,
  canSeeBioHighlight,
  filters,
  teamCodes,
  colorOptions,
  tableData,
  summaries,
  teamCodeWarningUsers,
  currentAppliedFilter,
  applyFilter,
}) {
  const [state, setState] = useState(() => initialState ?? defaultState);
  const [mode, setMode] = useState('create');
  const [selectedFilter, setSelectedFilter] = useState(() => currentAppliedFilter ?? null);
  const [updateFilter] = useUpdateWeeklySummariesFilterMutation();
  const [createFilter] = useCreateWeeklySummariesFilterMutation();

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  useEffect(() => {
    setSelectedFilter(currentAppliedFilter);
  }, [currentAppliedFilter]);

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
    // option: (base, state) => ({
    //   ...base,
    //   backgroundColor: state.isFocused
    //     ? darkMode
    //       ? '#434c5e'
    //       : '#eee'
    //     : darkMode
    //     ? '#2e3440'
    //     : '#fff',
    //   color: darkMode ? '#fff' : '#000',
    //   cursor: 'pointer',
    // }),
    option: (base, selectState) => {
      // 🟢 Fix: Extracted nested ternary into independent statements
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

  const handleSubmit = async e => {
    e.preventDefault();
    const validName = state.filterName.trim().length > 0 && state.filterName.trim().length <= 7;

    if ((mode === 'create' && validName) || (mode === 'update' && state.selectedFilter !== null)) {
      // No errors -> submit form
      const data = {
        filterName: mode === 'create' ? state.filterName.trim() : selectedFilter.label,
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
          const res = await createFilter({
            data,
          }).unwrap(); // unwrap = throw exception if error

          toast.success(`Successfully created filter ${state.filterName.trim()}`);
        } catch (error) {
          toast.error(`Failed to save new filter. Error: ${JSON.stringify(error)}`);
        }
      } else {
        try {
          const res = await updateFilter({
            id: selectedFilter.value,
            data,
          }).unwrap(); // unwrap = throw exception if error

          toast.success(`Successfully updated filter ${selectedFilter.label}`);
          if (currentAppliedFilter && selectedFilter.value === currentAppliedFilter.value) {
            applyFilter(normalizeFilter(res));
          }
        } catch (error) {
          toast.error(`Failed to update filter. Error: ${error}`);
        }
      }

      toggle();
    } else {
      toast.error(`Please set a valid filter name or select a filter to override.`);
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      toggle={toggle}
      className={darkMode ? 'create-filter-modal' : ''}
    >
      <ModalHeader toggle={toggle}>Create A New Filter or Override Existing Filter</ModalHeader>
      <ModalBody>
        <Form>
          <Select
            options={[
              { label: 'Create New', value: 'new' },
              { label: 'Override Existing Filter', value: 'override' },
            ]}
            classNamePrefix="custom-select" // Critical: This maps to the CSS above
            styles={darkMode ? darkSelectStyles : ''}
          />
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
                styles={customStyles}
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

          {mode === 'create' && (
            <FormGroup>
              <Label for="filterName" className={`${darkMode ? mainStyles.textWhite : ''}`}>
                Filter Name (up to 7 characters) *
              </Label>
              <Input
                id="filterName"
                value={state.filterName}
                onChange={e => setField(setState, 'filterName', e.target.value)}
                placeholder="Enter filter name"
                required={mode === 'create'}
                invalid={state.filterName.trim().length === 0}
                maxLength={7}
                className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                style={
                  darkMode
                    ? {
                        backgroundColor: '#1b2a41',
                        color: '#fff',
                        // This prevents the black background on click/focus
                        boxShadow: 'none',
                      }
                    : {}
                }
              />
              {state.filterName.trim().length === 0 && (
                <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
                  Filter name is required
                </div>
              )}
            </FormGroup>
          )}

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

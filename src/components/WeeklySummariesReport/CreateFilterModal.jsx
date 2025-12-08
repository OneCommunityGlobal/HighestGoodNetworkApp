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
import mainStyles from './WeeklySummariesReport.module.css';
import { setField } from '~/utils/stateHelper';
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
  teamCodes,
  colorOptions,
  tableData,
  summaries,
  teamCodeWarningUsers,
}) {
  const [state, setState] = useState(() => initialState ?? defaultState);
  const [mode, setMode] = useState('create');
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

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

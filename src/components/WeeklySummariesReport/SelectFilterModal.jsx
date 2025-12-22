import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form } from 'reactstrap';
import Select from 'react-select';
import mainStyles from './WeeklySummariesReport.module.css';
import FilterPreviewForm from './FilterPreviewForm.jsx';

export default function SelectFilterModal({
  state,
  setState,
  isOpen,
  toggle,
  filters,
  applyFilter,
  memberDict,
  darkMode,
}) {
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    if (isOpen) setSelectedFilter(null);
  }, [isOpen]);

  const handleSelectedFilter = () => {
    if (selectedFilter) applyFilter(selectedFilter);
    setSelectedFilter(null);
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      // Theme the actual modal content and backdrop
      contentClassName={darkMode ? mainStyles.darkModal : undefined}
      backdropClassName={darkMode ? mainStyles.darkBackdrop : undefined}
    >
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>
      <ModalBody>
        <Form>
          <div className="mb-2">Please select a filter:</div>
          <Select
            // REMOVE the forced light text: className="text-dark"
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            // react-select menu is portaled; theme it explicitly
            menuPortalTarget={document.body}
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              control: (base, s) => ({
                ...base,
                minHeight: 42,
                backgroundColor: darkMode ? '#0f1b2b' : '#ffffff',
                borderColor: s.isFocused
                  ? darkMode
                    ? '#60a5fa'
                    : '#2563eb'
                  : darkMode
                  ? '#334155'
                  : '#cbd5e1',
                boxShadow: 'none',
                ':hover': { borderColor: darkMode ? '#60a5fa' : '#2563eb' },
              }),
              valueContainer: base => ({ ...base, padding: '2px 10px' }),
              input: base => ({ ...base, color: darkMode ? '#f5f7fb' : '#111827' }),
              placeholder: base => ({ ...base, color: darkMode ? '#94a3b8' : '#6b7280' }),
              singleValue: base => ({ ...base, color: darkMode ? '#f5f7fb' : '#111827' }),
              menu: base => ({
                ...base,
                backgroundColor: darkMode ? '#0b1422' : '#ffffff',
                border: `1px solid ${darkMode ? '#334155' : '#e5e7eb'}`,
              }),
              menuList: base => ({
                ...base,
                maxHeight: 320,
                backgroundColor: darkMode ? '#0b1422' : '#ffffff',
              }),
              option: (base, s) => ({
                ...base,
                backgroundColor: s.isSelected
                  ? darkMode
                    ? '#1f2a44'
                    : '#dbeafe'
                  : s.isFocused
                  ? darkMode
                    ? '#16233a'
                    : '#eeeeee'
                  : darkMode
                  ? '#0b1422'
                  : '#ffffff',
                color: darkMode ? '#f5f7fb' : '#111827',
                ':active': { backgroundColor: darkMode ? '#1f2a44' : '#bfdbfe' },
                fontSize: 14,
              }),
              indicatorSeparator: base => ({
                ...base,
                backgroundColor: darkMode ? '#334155' : '#d1d5db',
              }),
              dropdownIndicator: base => ({
                ...base,
                color: darkMode ? '#cbd5e1' : '#6b7280',
                ':hover': { color: darkMode ? '#f5f7fb' : '#111827' },
              }),
              clearIndicator: base => ({
                ...base,
                color: darkMode ? '#cbd5e1' : '#6b7280',
                ':hover': { color: darkMode ? '#f5f7fb' : '#111827' },
              }),
            }}
            theme={t => ({
              ...t,
              colors: {
                ...t.colors,
                primary: darkMode ? '#60a5fa' : '#2563eb',
                primary25: darkMode ? '#16233a' : '#eeeeee',
                neutral0: darkMode ? '#0f1b2b' : '#ffffff',
                neutral80: darkMode ? '#f5f7fb' : '#111827',
              },
            })}
          />

          <FilterPreviewForm
            selectedFilter={selectedFilter}
            darkMode={darkMode}
            memberDict={memberDict}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          style={
            darkMode
              ? { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#fff' }
              : undefined
          }
          onClick={handleSelectedFilter}
          disabled={!selectedFilter}
        >
          Apply
        </Button>
        <Button
          style={
            darkMode
              ? { backgroundColor: '#334155', borderColor: '#334155', color: '#f5f7fb' }
              : undefined
          }
          color="secondary"
          onClick={toggle}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

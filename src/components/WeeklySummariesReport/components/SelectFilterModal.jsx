import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Label } from 'reactstrap';
import Select from 'react-select';
// import styles from './SelectFilterModal.module.scss';
import mainStyles from '../WeeklySummariesReport.module.css';
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

  const darkSelectStyles = {
    control: base => ({
      ...base,
      backgroundColor: '#1b2a41', // Solid background for the bar
      border: '1px solid #3a506b',
      boxShadow: 'none',
    }),
    // FIX STARTS HERE
    valueContainer: base => ({
      ...base,
      paddingLeft: '12px', // This pushes the 'S' away from the edge
    }),
    indicatorsContainer: base => ({
      ...base,
      paddingRight: '8px', // This prevents the arrow from touching the edge
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    input: base => ({
      ...base,
      color: '#ffffff', // Force white text while typing
    }),
    singleValue: base => ({
      ...base,
      color: '#ffffff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#334155' : state.isFocused ? '#243b55' : '#0f172a',
      color: '#ffffff',
      cursor: 'pointer',
    }),
  };

  // Keep lightSelectStyles as is, but ensure backgroundColor is 'transparent'
  // if you want the CSS variables to take over.

  const lightSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: state.isFocused ? '#2684ff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38,132,255,.25)' : 'none',
      color: '#212529',
    }),
    valueContainer: base => ({
      ...base,
      paddingLeft: '12px',
    }),
    indicatorsContainer: base => ({
      ...base,
      paddingRight: '8px',
    }),
    input: base => ({
      ...base,
      color: '#212529',
      caretColor: '#212529',
    }),
    placeholder: base => ({
      ...base,
      color: '#6c757d',
    }),
    singleValue: base => ({
      ...base,
      color: '#212529',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#ffffff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e9ecef' : state.isFocused ? '#f8f9fa' : '#ffffff',
      color: '#212529',
    }),
    menuPortal: base => ({
      ...base,
      zIndex: 1060,
    }),
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(null);
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
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? darkMode
          ? '#434c5e'
          : '#eee'
        : darkMode
        ? '#2e3440'
        : '#fff',
      color: darkMode ? '#fff' : '#000',
      cursor: 'pointer',
    }),
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

  const handleSelectedFilter = () => {
    applyFilter(selectedFilter);
    setSelectedFilter(null);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className={darkMode ? 'wsrDarkModal' : ''}>
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>

      <ModalBody>
        <Form>
          <div className={darkMode ? 'text-light' : ''}>Please select a filter:</div>
          <Select
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            required
            styles={customStyles}
          />

          <FilterPreviewForm
            selectedFilter={selectedFilter}
            darkMode={darkMode}
            memberDict={memberDict}
          />
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleSelectedFilter} disabled={!selectedFilter}>
          Apply
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

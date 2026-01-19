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

  const darkTheme = theme => ({
    ...theme,
    borderRadius: 6,
    colors: {
      ...theme.colors,

      // control
      neutral0: '#0f172a', // background
      neutral5: '#0f172a',
      neutral10: '#0f172a',
      neutral20: '#3a506b', // border
      neutral30: '#4dabf7',

      // text
      neutral80: '#ffffff',
      neutral60: '#94a3b8',

      // menu + options
      primary: '#334155',
      primary25: '#243b55',
      primary50: '#334155',

      // danger
      danger: '#ef4444',
      dangerLight: '#7f1d1d',
    },
  });

  const darkSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#0f172a',
      borderColor: state.isFocused ? '#4dabf7' : '#3a506b',
      boxShadow: 'none',
      color: '#ffffff',
    }),

    input: base => ({
      ...base,
      color: '#ffffff',
      caretColor: '#ffffff',
    }),

    placeholder: base => ({
      ...base,
      color: '#94a3b8',
    }),

    singleValue: base => ({
      ...base,
      color: '#ffffff',
    }),

    /** 🔥 MENU CONTAINER */
    menu: base => ({
      ...base,
      backgroundColor: '#0f172a',
      marginTop: 4,
    }),

    /** 🔥 THIS WAS MISSING */
    menuList: base => ({
      ...base,
      backgroundColor: '#0f172a',
      padding: 0,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#334155' : state.isFocused ? '#243b55' : '#0f172a',
      color: '#ffffff',
      cursor: 'pointer',
    }),

    /** REQUIRED FOR MODAL */
    menuPortal: base => ({
      ...base,
      zIndex: 1060,
    }),
  };

  const lightSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: state.isFocused ? '#2684ff' : '#ced4da',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(38,132,255,.25)' : 'none',
      color: '#212529',
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

  const handleSelectedFilter = () => {
    applyFilter(selectedFilter);
    setSelectedFilter(null);
    toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      style={{
        backgroundColor: darkMode ? '#1b2a41' : undefined,
        color: darkMode ? '#ffffff' : undefined,
      }}
    >
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>

      <ModalBody>
        <Form>
          <div className={darkMode ? mainStyles.textWhite : ''}>Please select a filter:</div>

          <Select
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            classNamePrefix="rs"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={darkMode ? darkSelectStyles : lightSelectStyles}
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

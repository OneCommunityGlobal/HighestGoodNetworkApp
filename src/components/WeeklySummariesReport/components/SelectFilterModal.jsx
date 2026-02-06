import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Label } from 'reactstrap';
import Select from 'react-select';
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

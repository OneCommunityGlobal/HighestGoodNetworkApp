import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Label } from 'reactstrap';
import Select from 'react-select';
import FilterPreviewForm from './FilterPreviewForm.jsx';
import { getCustomStyles } from '~/utils/reactSelectStyles'; //  Import Styles

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

  const customStyles = getCustomStyles(darkMode);

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

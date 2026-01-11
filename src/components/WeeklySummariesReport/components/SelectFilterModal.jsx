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
    <Modal isOpen={isOpen} toggle={toggle} className={`${darkMode ? mainStyles.darkModal : ''}`}>
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>
      <ModalBody>
        <Form>
          <div>Please select a filter:</div>
          <Select
            className="text-dark"
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            required
          />
          <FilterPreviewForm
            selectedFilter={selectedFilter}
            darkMode={darkMode}
            memberDict={memberDict}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSelectedFilter}>
          Apply
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form } from 'reactstrap';
import Select from 'react-select';

export default function SelectFilterModal({ isOpen, toggle, filters, applyFilter }) {
  const [selectedFilter, setSelectedFilter] = useState('');
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggle} className="weekly-summaries-report">
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>
      <ModalBody>
        <Form>
          <div>Please select a filter:</div>
          <Select options={filters} value={selectedFilter} onChange={setSelectedFilter} />
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => applyFilter(selectedFilter)}>
          Apply
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';

function SaveFilterModal({
  isOpen,
  onClose,
  onSave,
  selectedCodes,
  darkMode,
  existingFilterNames,
}) {
  const [filterName, setFilterName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!filterName.trim()) {
      setError('Please enter a filter name');
      return;
    }

    if (filterName.trim().length < 3) {
      setError('Filter name must be at least 3 characters long');
      return;
    }

    // Check for duplicate names
    if (existingFilterNames && existingFilterNames.includes(filterName.trim())) {
      setError('Filter name already exists.');
      return;
    }

    setError('');
    onSave(filterName.trim());
    setFilterName('');
    onClose();
  };

  const handleClose = () => {
    setFilterName('');
    setError('');
    onClose();
  };

  const handleInputChange = e => {
    setFilterName(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const selectedCodesText = selectedCodes.map(code => code.label.split(' (')[0].trim()).join(', ');

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader toggle={handleClose} className={darkMode ? 'bg-space-cadet' : ''}>
        Save Team Code Filter
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <FormGroup>
            <Label for="filterName" className={darkMode ? 'text-light' : ''}>
              Filter Name
            </Label>
            <Input
              id="filterName"
              type="text"
              placeholder="Enter a name for this filter"
              value={filterName}
              onChange={handleInputChange}
              className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </FormGroup>
          <FormGroup>
            <Label className={darkMode ? 'text-light' : ''}>Selected Team Codes:</Label>
            <div
              className={`p-2 border rounded ${
                darkMode ? 'bg-darkmode-liblack text-light' : 'bg-light'
              }`}
            >
              {selectedCodesText || 'No codes selected'}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={handleClose} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
        <Button color="primary" onClick={handleSave} style={darkMode ? boxStyleDark : boxStyle}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

SaveFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedCodes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  darkMode: PropTypes.bool,
  existingFilterNames: PropTypes.arrayOf(PropTypes.string),
};

SaveFilterModal.defaultProps = {
  darkMode: false,
  existingFilterNames: [],
};

export default SaveFilterModal;

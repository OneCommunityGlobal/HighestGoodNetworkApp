import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
  Alert,
} from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';

function SaveFilterModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  selectedCodes,
  darkMode,
  existingFilterNames,
  currentFilter,
  isModification = false,
}) {
  const [filterName, setFilterName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFilterName('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (isModification) {
      // For modifications, use the current filter name and just update the team codes
      onUpdate(currentFilter.name);
    } else {
      // For new filters, validate the name
      const trimmedName = filterName.trim();

      if (!trimmedName) {
        setError('Filter name is required.');
        return;
      }

      if (trimmedName.length > 7) {
        setError('Filter name must be 7 characters or less.');
        return;
      }

      if (existingFilterNames.includes(trimmedName)) {
        setError('Filter name already exists.');
        return;
      }

      onSave(trimmedName);
    }
  };

  const handleClose = () => {
    setFilterName('');
    setError('');
    onClose();
  };

  const selectedCodesText = selectedCodes.map(code => code.label.split(' (')[0].trim()).join(', ');

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader toggle={handleClose} className={darkMode ? 'bg-space-cadet' : ''}>
        {isModification
          ? `Update Filter: ${currentFilter?.name || 'Unknown Filter'}`
          : 'Save Filter'}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        {isModification ? (
          // For modifications, show current filter name as read-only
          <FormGroup>
            <Label className={darkMode ? 'text-light' : ''}>Filter Name</Label>
            <div
              className={`p-2 border rounded ${
                darkMode ? 'bg-darkmode-liblack text-light' : 'bg-light'
              }`}
            >
              {currentFilter?.name || 'Unknown Filter'}
            </div>
          </FormGroup>
        ) : (
          // For new filters, show input field
          <FormGroup>
            <Label for="filterName" className={darkMode ? 'text-light' : ''}>
              Filter Name (max 7 characters)
            </Label>
            <Input
              id="filterName"
              type="text"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              maxLength={7}
              placeholder="Enter filter name"
              className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}
            />
          </FormGroup>
        )}

        {error && <Alert color="danger">{error}</Alert>}

        <FormGroup>
          <Label className={darkMode ? 'text-light' : ''}>
            {isModification ? 'Updated Team Codes:' : 'Selected Team Codes:'}
          </Label>
          <div
            className={`p-2 border rounded ${
              darkMode ? 'bg-darkmode-liblack text-light' : 'bg-light'
            }`}
          >
            {selectedCodesText || 'No codes selected'}
          </div>
        </FormGroup>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={handleClose} style={darkMode ? boxStyleDark : boxStyle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave} style={darkMode ? boxStyleDark : boxStyle}>
          {isModification ? 'Update' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

SaveFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  selectedCodes: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
  existingFilterNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentFilter: PropTypes.shape({
    name: PropTypes.string,
  }),
  isModification: PropTypes.bool,
};

SaveFilterModal.defaultProps = {
  onUpdate: null,
  currentFilter: null,
  isModification: false,
};

export default SaveFilterModal;

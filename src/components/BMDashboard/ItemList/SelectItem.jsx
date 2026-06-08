import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import styles from './ItemListView.module.css';

const ITEM_KEY = 'tool_selected_items';

export default function SelectItem({ items, selectedProject, selectedItem, setSelectedItem, label }) {
  const [localValues, setLocalValues] = useState([]);

  // Build contextually aware tool options based on the active project selections
  const itemOptions = useMemo(() => {
    if (!items?.length) return [];

    let list = items;
    if (Array.isArray(selectedProject) && selectedProject.length > 0) {
      list = items.filter(i => selectedProject.includes(i.project?.name));
    }

    // Fixed: Added optional chaining safety wrapper
    const names = [...new Set(list.map(i => i.itemType?.name).filter(Boolean))];

    return names.map(name => ({
      label: name,
      value: name,
    }));
  }, [items, selectedProject]);

  // Restore cached selections from persistent state safely
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ITEM_KEY));
      if (Array.isArray(saved)) {
        setLocalValues(saved);
        setSelectedItem(saved.map(s => s.value));
      }
    } catch (error) {
      console.error('Failed to parse cached item filter scope:', error);
    }
  }, [setSelectedItem]);

  // Catch reset triggers fired from parent views/companion components
  useEffect(() => {
    if (Array.isArray(selectedItem) && selectedItem.length === 0) {
      setLocalValues([]);
    }
  }, [selectedItem]);

  // Auto-prune active selection tags if they fall out of scope when projects shift
  useEffect(() => {
    if (localValues.length > 0 && itemOptions.length > 0) {
      const activeKeys = itemOptions.map(opt => opt.value);
      const alignedValues = localValues.filter(val => activeKeys.includes(val.value));
      
      if (alignedValues.length !== localValues.length) {
        setLocalValues(alignedValues);
        setSelectedItem(alignedValues.map(v => v.value));
        localStorage.setItem(ITEM_KEY, JSON.stringify(alignedValues));
      }
    }
  }, [itemOptions, localValues, setSelectedItem]);

  const handleChange = selected => {
    const values = selected || [];

    setLocalValues(values);
    setSelectedItem(values.map(v => v.value));
    localStorage.setItem(ITEM_KEY, JSON.stringify(values));
  };

  return (
    <Form>
      <FormGroup className={styles.selectInput}>
        <Label htmlFor="select-item" style={{ marginLeft: '10px' }}>
          {label ? `${label}:` : 'Material:'}
        </Label>
        <Select
          inputId="select-item"
          isMulti
          isSearchable
          isClearable
          options={itemOptions}
          value={localValues}
          onChange={handleChange}
          isDisabled={!items?.length}
          placeholder="Search or select..."
          classNamePrefix="react-select"
        />
        <small className={styles.helperText}>
          Search and select one or more items to filter results.
        </small>
      </FormGroup>
    </Form>
  );
}

SelectItem.propTypes = {
  items: PropTypes.array.isRequired,
  selectedProject: PropTypes.array.isRequired,
  selectedItem: PropTypes.array.isRequired,
  setSelectedItem: PropTypes.func.isRequired,
  label: PropTypes.string,
};
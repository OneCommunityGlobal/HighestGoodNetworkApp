import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './ItemListView.module.css';
import { getReactSelectStyles } from './selectStyles.js';

const ITEM_KEY = 'tool_selected_items';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  label,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [localValues, setLocalValues] = useState([]);

  const itemOptions = useMemo(() => {
    if (!items?.length) return [];

    let list = items;
    if (Array.isArray(selectedProject) && selectedProject.length > 0) {
      list = items.filter(i => selectedProject.includes(i.project?.name));
    }

    const names = [...new Set(list.map(i => i.itemType?.name).filter(Boolean))];
    return names.map(name => ({ label: name, value: name }));
  }, [items, selectedProject]);

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

  useEffect(() => {
    if (Array.isArray(selectedItem) && selectedItem.length === 0) {
      setLocalValues([]);
    }
  }, [selectedItem]);

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
    <Form className={styles.filterItem} onSubmit={e => e.preventDefault()}>
      <FormGroup className={styles.selectInput}>
        <Label htmlFor="select-item">{label ? `${label}:` : 'Material:'}</Label>
        <Select
          inputId="select-item"
          isMulti
          isSearchable
          isClearable
          options={itemOptions}
          value={localValues}
          onChange={handleChange}
          isDisabled={!items?.length}
          placeholder="Search or select Tools..."
          classNamePrefix="react-select"
          styles={getReactSelectStyles(darkMode)}
        />
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
import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import styles from './ItemListView.module.css';

const ITEM_KEY = 'tool_selected_items';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  label,
}) {
  const [localValues, setLocalValues] = useState([]);

  // ✅ Build filtered tool options
  const itemOptions = useMemo(() => {
    if (!items?.length) return [];

    let list = items;

    if (Array.isArray(selectedProject)) {
      list = items.filter(i => selectedProject.includes(i.project?.name) && i.itemType?.name);
    } else if (selectedProject !== 'all') {
      list = items.filter(i => i.project?.name === selectedProject && i.itemType?.name);
    } else {
      list = items.filter(i => i.itemType?.name);
    }

    const names = [...new Set(list.map(i => i.itemType.name))];

    return names.map(name => ({
      label: name,
      value: name,
    }));
  }, [items, selectedProject]);

  // ✅ Restore saved selections
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(ITEM_KEY));

    if (Array.isArray(saved)) {
      setLocalValues(saved);
      setSelectedItem(saved.map(s => s.value));
    }
  }, []);

  // ✅ Sync reset from parent
  useEffect(() => {
    const isMulti = Array.isArray(selectedItem);

    if (selectedItem === 'all' || (isMulti && selectedItem.length === 0)) {
      setLocalValues([]);
    }
  }, [selectedItem]);

  const handleChange = selected => {
    const values = selected || [];

    setLocalValues(values);
    setSelectedItem(values.length ? values.map(v => v.value) : 'all');

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
          Search and select one or more tools to filter results.
        </small>
      </FormGroup>
    </Form>
  );
}

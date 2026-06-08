import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import styles from './ItemListView.module.css';

const PROJECT_KEY = 'tool_selected_projects';

export default function SelectForm({ items, setSelectedProject, setSelectedItem }) {
  const [localValues, setLocalValues] = useState([]);

  // Build complete option items list from incoming data
  const projectOptions = useMemo(() => {
    if (!items?.length) return [];
    const unique = [...new Set(items.map(i => i.project?.name).filter(Boolean))];
    return unique.map(name => ({
      label: name,
      value: name,
    }));
  }, [items]);

  // Restore saved filter configuration arrays on boot
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROJECT_KEY));
      if (Array.isArray(saved)) {
        setLocalValues(saved);
        setSelectedProject(saved.map(p => p.value));
      }
    } catch (error) {
      console.error('Failed to parse cached project filters:', error);
    }
  }, [setSelectedProject]);

  const handleChange = selected => {
    const values = selected || [];

    setLocalValues(values);
    setSelectedProject(values.map(v => v.value));
    
    // Cascading reset: Wiping project selection resets the selected material tokens
    setSelectedItem([]); 

    localStorage.setItem(PROJECT_KEY, JSON.stringify(values));
  };

  return (
    <Form>
      <FormGroup className={styles.selectInput}>
        <Label htmlFor="select-project">Project:</Label>
        <Select
          inputId="select-project"
          isMulti
          isSearchable
          isClearable
          options={projectOptions}
          value={localValues}
          onChange={handleChange}
          isDisabled={!items?.length}
          placeholder="Search or select projects..."
          classNamePrefix="react-select"
        />
        <small className={styles.helperText}>Select one or more projects to filter results.</small>
      </FormGroup>
    </Form>
  );
}

SelectForm.propTypes = {
  items: PropTypes.array.isRequired,
  setSelectedProject: PropTypes.func.isRequired,
  setSelectedItem: PropTypes.func.isRequired,
};
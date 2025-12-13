import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import styles from './ItemListView.module.css';

const PROJECT_KEY = 'tool_selected_projects';

export default function SelectForm({ items, setSelectedProject, setSelectedItem }) {
  const [selectedProjects, setSelectedProjects] = useState([]);

  // Build project list
  const projectOptions = useMemo(() => {
    if (!items?.length) return [];
    const unique = [...new Set(items.map(i => i.project?.name).filter(Boolean))];
    return unique.map(name => ({
      label: name,
      value: name,
    }));
  }, [items]);

  // Restore saved values
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(PROJECT_KEY));

    if (Array.isArray(saved)) {
      setSelectedProjects(saved);
      setSelectedProject(saved.map(p => p.value));
    }
  }, []);

  const handleChange = selected => {
    const values = selected || [];

    setSelectedProjects(values);
    setSelectedItem('all');
    setSelectedProject(values.length ? values.map(v => v.value) : 'all');

    localStorage.setItem(PROJECT_KEY, JSON.stringify(values));
  };

  return (
    <Form>
      <FormGroup className={styles.selectInput}>
        <Label>Project:</Label>

        <Select
          isMulti
          isSearchable
          isClearable
          options={projectOptions}
          value={selectedProjects}
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

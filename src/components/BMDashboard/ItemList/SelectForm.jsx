import { useEffect, useMemo } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './ItemListView.module.css';
import { getReactSelectStyles } from './selectStyles.js';

const PROJECT_KEY = 'tool_selected_projects';

export default function SelectForm({ items, setSelectedProject, localValues, setLocalValues }) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const projectOptions = useMemo(() => {
    if (!items?.length) return [];
    const unique = [...new Set(items.map(i => i.project?.name).filter(Boolean))];
    return unique.map(name => ({ label: name, value: name }));
  }, [items]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROJECT_KEY));
      if (Array.isArray(saved) && saved.length > 0) {
        setLocalValues(saved);
        setSelectedProject(saved.map(p => p.value));
      }
    } catch (error) {
      console.error('Failed to parse cached project filters:', error);
    }
  }, []);

  const handleChange = selected => {
    const values = selected || [];
    setLocalValues(values);
    setSelectedProject(values.map(v => v.value));
    localStorage.setItem(PROJECT_KEY, JSON.stringify(values));
  };

  return (
    <Form className={styles.filterForm} onSubmit={e => e.preventDefault()}>
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
          styles={getReactSelectStyles(darkMode)}
        />
      </FormGroup>
    </Form>
  );
}

SelectForm.propTypes = {
  items: PropTypes.array.isRequired,
  setSelectedProject: PropTypes.func.isRequired,
  localValues: PropTypes.array.isRequired,
  setLocalValues: PropTypes.func.isRequired,
};
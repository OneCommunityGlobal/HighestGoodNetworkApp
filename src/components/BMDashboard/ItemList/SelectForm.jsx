import { useEffect, useMemo } from 'react';

import Select from 'react-select';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './ItemListView.module.css';
import { getReactSelectStyles } from './selectStyles.js';

export default function SelectForm({
  items,
  setSelectedProject,
  localValues,
  setLocalValues,
  itemType,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const projectKey = `${itemType}_selected_projects`;

  const projectOptions = useMemo(() => {
    if (!items?.length) return [];
    const unique = [...new Set(items.map(i => i.project?.name).filter(Boolean))];
    return unique.map(name => ({ label: name, value: name }));
  }, [items]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(projectKey));
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
    localStorage.setItem(projectKey, JSON.stringify(values));
  };

  return (
    <div className={`${styles.filterItem} ${styles.filterItemSelect}`}>
      <label htmlFor="select-project" style={{ fontWeight: 'bold' }}>
        Project:
      </label>
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
    </div>
  );
}

SelectForm.propTypes = {
  items: PropTypes.array.isRequired,
  setSelectedProject: PropTypes.func.isRequired,
  localValues: PropTypes.array.isRequired,
  setLocalValues: PropTypes.func.isRequired,
  itemType: PropTypes.string.isRequired,
};

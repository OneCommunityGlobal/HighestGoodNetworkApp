import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label, Button } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import styles from './ItemListView.module.css';
import { useSelector } from 'react-redux';
const PROJECT_KEY = 'tool_selected_projects';

export default function SelectForm({ items, setSelectedProject, localValues, setLocalValues }) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
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
      if (Array.isArray(saved) && saved.length > 0) {
        // Check length so we don't overwrite fresh resets
        setLocalValues(saved);
        setSelectedProject(saved.map(p => p.value));
      }
    } catch (error) {
      console.error('Failed to parse cached project filters:', error);
    }
    // Wiped dependency array down to [] so it truly only runs once on mount/boot
  }, []);

  const handleChange = selected => {
    const values = selected || [];

    setLocalValues(values);
    setSelectedProject(values.map(v => v.value));

    localStorage.setItem(PROJECT_KEY, JSON.stringify(values));
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: darkMode ? '#2a3f5f' : base.backgroundColor,
      borderColor: darkMode ? '#3a506b' : base.borderColor,
      color: darkMode ? '#e0e0e0' : base.color,
      boxShadow: state.isFocused
        ? darkMode
          ? '0 0 0 1px #6af1ea'
          : base.boxShadow
        : base.boxShadow,
      '&:hover': {
        borderColor: darkMode
          ? '#5a7a9b'
          : base['&:hover']
          ? base['&:hover'].borderColor
          : base.borderColor,
      },
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#1c2541' : base.backgroundColor,
      border: darkMode ? '1px solid #3a506b' : base.border,
    }),
    option: (base, state) => {
      let backgroundColor = base.backgroundColor;
      if (state.isSelected) {
        backgroundColor = darkMode ? '#3a506b' : base.backgroundColor;
      } else if (state.isFocused) {
        backgroundColor = darkMode ? '#2a3f5f' : base.backgroundColor;
      } else {
        backgroundColor = darkMode ? '#1c2541' : base.backgroundColor;
      }

      return {
        ...base,
        backgroundColor,
        color: darkMode ? '#e0e0e0' : base.color,
        '&:hover': {
          backgroundColor: darkMode
            ? '#3a506b'
            : base['&:hover']
            ? base['&:hover'].backgroundColor
            : base.backgroundColor,
        },
      };
    },
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#3a506b' : base.backgroundColor,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#ffffff' : base.color,
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#ffffff' : base.color,
      '&:hover': {
        backgroundColor: darkMode ? '#5a7a9b' : '#e9ecef',
        color: darkMode ? '#ffffff' : '#495057',
      },
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#b5bac5' : base.color,
    }),
    singleValue: base => ({
      ...base,
      color: darkMode ? '#e0e0e0' : base.color,
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#e0e0e0' : base.color,
    }),
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
          styles={selectStyles}
        />
      </FormGroup>
    </Form>
  );
}

SelectForm.propTypes = {
  items: PropTypes.array.isRequired,
  setSelectedProject: PropTypes.func.isRequired,
  setSelectedItem: PropTypes.func.isRequired,
};

import { useEffect, useMemo, useState } from 'react';
import { Form, FormGroup, Label } from 'reactstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import styles from './ItemListView.module.css';
import { useSelector } from 'react-redux';
const ITEM_KEY = 'tool_selected_items';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  selectedToolStatus,
  setSelectedToolStatus,
  selectedCondition,
  setSelectedCondition,
  label,
  darkMode,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
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

  const darkStyle = darkMode
    ? { backgroundColor: '#1e293b', color: '#e5e7eb', borderColor: '#334155' }
    : undefined;

  const getSelectValue = () => {
    if (label === 'Condition') return selectedCondition;
    if (label === 'Tool Status') return selectedToolStatus;
    return selectedItem;
  };

  const handleSelectChange = e => {
    const val = e.target.value;
    if (label === 'Tool Status') setSelectedToolStatus(val);
    else if (label === 'Condition') setSelectedCondition(val);
    else setSelectedItem(val);
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
          styles={selectStyles}
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

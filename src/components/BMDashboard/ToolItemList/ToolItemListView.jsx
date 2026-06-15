// ToolItemListView.jsx

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux'; // Added to tap into your application theme state
import BMError from '../shared/BMError';
import SelectForm from '../ItemList/SelectForm';
import SelectItem from '../ItemList/SelectItem';
import ToolItemsTable from './ToolItemsTable';
import styles from './ToolItemListView.module.css';
import { Button } from 'reactstrap';

const PROJECT_KEY = 'tool_selected_projects';
const ITEM_KEY = 'tool_selected_items';

export function ToolItemListView({
  itemType,
  items,
  errors = {},
  UpdateItemModal,
  dynamicColumns,
}) {
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [localValues, setLocalValues] = useState([]);

  // Safely grab current theme state configuration
  const darkMode = useSelector(state => state.theme?.darkMode);
  const themeClass = darkMode ? styles.darkTheme : styles.lightTheme;

  // Load initial items
  useEffect(() => {
    if (Array.isArray(items)) {
      setFilteredItems([...items]);
    }
  }, [items]);

  // FULL multi-select compatible filtering
  useEffect(() => {
    if (!Array.isArray(items)) return;

    const projectIsMulti = Array.isArray(selectedProject);
    const itemIsMulti = Array.isArray(selectedItem);

    const hasProjects = projectIsMulti && selectedProject.length > 0;
    const hasItems = itemIsMulti && selectedItem.length > 0;

    let result = [...items];

    // Project filter (single + multi)
    if (hasProjects) {
      result = result.filter(item => selectedProject.includes(item.project?.name));
    } else if (!projectIsMulti && selectedProject !== 'all') {
      result = result.filter(item => item.project?.name === selectedProject);
    }

    // Item / Tool filter (single + multi)
    if (hasItems) {
      result = result.filter(item => selectedItem.includes(item.itemType?.name));
    } else if (!itemIsMulti && selectedItem !== 'all') {
      result = result.filter(item => item.itemType?.name === selectedItem);
    }

    setFilteredItems(result);
  }, [selectedProject, selectedItem, items]);

  // Error handling
  useEffect(() => {
    setIsError(Object.entries(errors).length > 0);
  }, [errors]);

  // The Reset Handler
  const handleReset = () => {
    setLocalValues([]); // Clear React-Select UI
    setSelectedProject([]); // Clear parent project state
    setSelectedItem([]); // Clear parent item state
    localStorage.removeItem(PROJECT_KEY); // Clear localStorage cache
    localStorage.removeItem(ITEM_KEY); // Clear item filter cache as well
  };

  if (isError) {
    return (
      <main className={`${styles.itemsListContainer} ${themeClass}`}>
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.itemsListContainer} ${themeClass}`}>
      <h3 className={styles.viewTitle}>{itemType}</h3>

      <section className={styles.selectContainers}>
        <div className={styles.containers}>
          {items && (
            <div className={styles.filtersWrapper}>
              <div className={styles.filterGroup}>
                <SelectForm
                  items={items}
                  setSelectedProject={setSelectedProject}
                  localValues={localValues}
                  setLocalValues={setLocalValues}
                />
              </div>

              <div className={styles.filterGroup}>
                <SelectItem
                  items={items}
                  selectedProject={selectedProject}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  label="Tool"
                />
              </div>

              <div className={styles.resetContainer}>
                <Button
                  type="button"
                  color="danger"
                  onClick={handleReset}
                  disabled={
                    localStorage.getItem(PROJECT_KEY) === null &&
                    localStorage.getItem(ITEM_KEY) === null
                  }
                  className={styles.resetButton}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {filteredItems && (
          <div className={darkMode ? styles.darkModeTable : ''}>
            <ToolItemsTable
              selectedProject={selectedProject}
              selectedItem={selectedItem}
              filteredItems={filteredItems}
              UpdateItemModal={UpdateItemModal}
              dynamicColumns={dynamicColumns}
              className={styles.filteredTable}
            />
          </div>
        )}
      </section>
    </main>
  );
}

ToolItemListView.propTypes = {
  itemType: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  errors: PropTypes.shape({
    message: PropTypes.string,
  }),
  UpdateItemModal: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]),
  dynamicColumns: PropTypes.array,
};

ToolItemListView.defaultProps = {
  itemType: 'Tools',
  errors: {},
  UpdateItemModal: null,
  dynamicColumns: [],
};

export default ToolItemListView;

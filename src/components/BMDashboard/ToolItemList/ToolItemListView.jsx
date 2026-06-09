import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

  // Load initial items
  useEffect(() => {
    if (Array.isArray(items)) {
      setFilteredItems([...items]);
    }
  }, [items]);

  // ✅ FULL multi-select compatible filtering
  useEffect(() => {
    if (!Array.isArray(items)) return;

    const projectIsMulti = Array.isArray(selectedProject);
    const itemIsMulti = Array.isArray(selectedItem);

    const hasProjects = projectIsMulti && selectedProject.length > 0;
    const hasItems = itemIsMulti && selectedItem.length > 0;

    let result = [...items];

    // ✅ Project filter (single + multi)
    if (hasProjects) {
      result = result.filter(item => selectedProject.includes(item.project?.name));
    } else if (!projectIsMulti && selectedProject !== 'all') {
      result = result.filter(item => item.project?.name === selectedProject);
    }

    // ✅ Item / Tool filter (single + multi)
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

  // 1. The Reset Handler
  const handleReset = () => {
    setLocalValues([]); // Clear React-Select UI
    setSelectedProject([]); // Clear parent project state
    setSelectedItem([]); // Clear parent item state
    localStorage.removeItem(PROJECT_KEY); // Clear localStorage cache
    localStorage.removeItem(ITEM_KEY); // Clear item filter cache as well
  };

  if (isError) {
    return (
      <main className={styles.itemsListContainer}>
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={styles.itemsListContainer}>
      <h3>{itemType}</h3>

      <section className={styles.selectContainers}>
        <div className={styles.containers}>
          {items && (
            <>
              <SelectForm
                items={items}
                setSelectedProject={setSelectedProject}
                localValues={localValues}
                setLocalValues={setLocalValues}
              />

              <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                label="Tool"
              />
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
            </>
          )}
        </div>

        {filteredItems && (
          <ToolItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
            filteredItems={filteredItems}
            UpdateItemModal={UpdateItemModal}
            dynamicColumns={dynamicColumns}
            className={styles.filteredTable}
          />
        )}
      </section>
    </main>
  );
}

ToolItemListView.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  errors: PropTypes.shape({
    message: PropTypes.string,
  }),
};

ToolItemListView.defaultProps = {
  errors: {},
};

export default ToolItemListView;

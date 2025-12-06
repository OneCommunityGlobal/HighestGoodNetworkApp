import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BMError from '../shared/BMError';
import SelectForm from '../ItemList/SelectForm';
import SelectItem from '../ItemList/SelectItem';
import ToolItemsTable from './ToolItemsTable';
import styles from './ToolItemListView.module.css';
import { set } from 'lodash';

export function ToolItemListView({
  itemType,
  items,
  errors = {},
  UpdateItemModal,
  dynamicColumns,
}) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [selectedToolStatus, setSelectedToolStatus] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (items) setFilteredItems([...items]);
  }, [items]);

  useEffect(() => {
    if (!items) return;

    let filterItems = [...items];

    if (selectedProject !== 'all') {
      filterItems = filterItems.filter(item => item.project?.name === selectedProject);
    }

    if (selectedItem !== 'all') {
      filterItems = filterItems.filter(item => item.itemType?.name === selectedItem);
    }

    if (selectedToolStatus !== 'all') {
      filterItems = filterItems.filter(item => {
        if (selectedToolStatus === 'Using') {
          return item.itemType?.using?.includes(item._id);
        } else if (selectedToolStatus === 'Available') {
          return (
            item.itemType?.available?.includes(item._id) &&
            item.condition !== 'Lost' &&
            item.condition !== 'Needs Replacing'
          );
        }
        return true;
        // if (selectedToolStatus === 'Under Maintenance') {
        //   // UPDATE LOGIC TO MATCH THE CONDITIONS
        //   return !item.using && !item.available;
        // }
      });
    }

    if (selectedCondition !== 'all') {
      filterItems = filterItems.filter(item => item.condition === selectedCondition);
    }

    setFilteredItems(filterItems);
  }, [items, selectedProject, selectedItem, selectedToolStatus, selectedCondition]);

  useEffect(() => {
    setIsError(Object.entries(errors).length > 0);
  }, [errors]);

  if (isError) {
    return (
      <main className={`${styles.itemsListContainer}`}>
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }
  return (
    <main className={`${styles.itemsListContainer}`}>
      <h3>{itemType}</h3>
      <section>
        <span style={{ display: 'flex', margin: '5px' }}>
          {items && (
            <>
              <SelectForm
                items={items}
                setSelectedProject={setSelectedProject}
                setSelectedItem={setSelectedItem}
                setSelectedCondition={setSelectedCondition}
                setSelectedToolStatus={setSelectedToolStatus}
              />
              <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                selectedToolStatus={selectedToolStatus}
                setSelectedToolStatus={setSelectedToolStatus}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                label="Tool"
              />
              <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                selectedToolStatus={selectedToolStatus}
                setSelectedToolStatus={setSelectedToolStatus}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                label="Tool Status"
              />
              <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                selectedToolStatus={selectedToolStatus}
                setSelectedToolStatus={setSelectedToolStatus}
                selectedCondition={selectedCondition}
                setSelectedCondition={setSelectedCondition}
                label="Condition"
              />
            </>
          )}
        </span>
        {filteredItems && (
          <ToolItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
            selectedToolStatus={selectedToolStatus}
            selectedCondition={selectedCondition}
            filteredItems={filteredItems}
            UpdateItemModal={UpdateItemModal}
            dynamicColumns={dynamicColumns}
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

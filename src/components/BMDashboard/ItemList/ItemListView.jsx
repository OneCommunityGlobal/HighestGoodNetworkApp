import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import './ItemListView.css';

export function ItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    if (items) setFilteredItems([...items]);
  }, [items]);


  useEffect(() => {
    let filterItems;
    if (!items) return;
    if (selectedProject === 'all' && selectedItem === 'all') {
      setFilteredItems([...items]);
    } else if (selectedProject !== 'all' && selectedItem === 'all') {
      filterItems = items.filter(item => item.project?.name === selectedProject);
      setFilteredItems([...filterItems]);
    } else if (selectedProject === 'all' && selectedItem !== 'all') {
      filterItems = items.filter(item => item.itemType?.name === selectedItem);
      setFilteredItems([...filterItems]);
    } else {
      filterItems = items.filter(
        item => item.project?.name === selectedProject && item.itemType?.name === selectedItem,
      );
      setFilteredItems([...filterItems]);
    }
  }, [selectedProject, selectedItem, items]);

  useEffect(() => {
    setIsError(Object.entries(errors).length > 0);
  }, [errors]);

  if (isError) {
    return (
      <main className="items_list_container">
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="items_list_container">
      <h3>{itemType}</h3>
      <section>
        <span style={{ display: 'flex', margin: '5px' }}>
          {items && (
            <>
              <SelectForm
                items={items}
                setSelectedProject={setSelectedProject}
                setSelectedItem={setSelectedItem}
              />
              <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </>
          )}
        </span>
        {filteredItems && <ItemsTable selectedProject={selectedProject} selectedItem={selectedItem} filteredItems={filteredItems} UpdateItemModal={UpdateItemModal} dynamicColumns={dynamicColumns} />}
      </section>
    </main>
  );
}

ItemListView.propTypes = {
  items: PropTypes.array.isRequired,
  errors: PropTypes.object,
  fetchItems: PropTypes.func.isRequired,
};

ItemListView.defaultProps = {
  errors: {},
};

export default ItemListView;

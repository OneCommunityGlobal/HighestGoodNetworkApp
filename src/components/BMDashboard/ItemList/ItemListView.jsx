import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import './ItemListView.css';

export function ItemListView({ items, errors, fetchItems, UpdateItemModal }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      <main className="materials_list_container">
        <h2>Items List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="materials_list_container">
      <h3>Items</h3>
      <section>
        <span style={{ display: 'flex', margin: '5px' }}>
          {items && (
            <>
              <SelectForm
                materials={items}
                setSelectedProject={setSelectedProject}
                setSelectedMaterial={setSelectedItem}
              />
              <SelectItem
                materials={items}
                selectedProject={selectedProject}
                selectedMaterial={selectedItem}
                setSelectedMaterial={setSelectedItem}
              />
            </>
          )}
        </span>
        {filteredItems && <ItemsTable filteredItems={filteredItems} UpdateItemModal={UpdateItemModal} />}
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

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import BMError from '../shared/BMError';
import ToolSelectForm from './ToolSelectForm';
import ToolSelectItem from './ToolSelectItem';
import ToolItemsTable from './ToolItemsTable';
import './ToolItemListView.css';

export function ToolItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);

///TEMP
    // useEffect(() => {
    //   console.log("itemType: ", itemType, ", items: ", items, ", errors: ", errors, ", dynamicColumns: ", dynamicColumns)
    // }, []);

//  useEffect(() => {
//   console.log("filteredItems: ", filteredItems)
//  }, [filteredItems]);

  useEffect(() => {
    if (items) setFilteredItems([...items]);
  }, [items]);

  useEffect(() => {
    // console.log("useEff,  selectedProject, selectedItem or items changed")
    let filterItems;
    if (!items) return;
    if (selectedProject === 'all' && selectedItem === 'all') {
      // console.log("selectedProject & selectedItem === all")
      setFilteredItems([...items]);
    } else if (selectedProject !== 'all' && selectedItem === 'all') {
      console.log("selectedProject !== all & selectedItem === all")
      filterItems = items.filter(item => item.project?.name === selectedProject);
      setFilteredItems([...filterItems]);
    } else if (selectedProject === 'all' && selectedItem !== 'all') {
      console.log("selectedProject === all & selectedItem !== all")
      filterItems = items.filter(item => item.itemType?.name === selectedItem);
      setFilteredItems([...filterItems]);
    } else {
      console.log("ELSE block")
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
  // console.log("alles in ordnung...")
  return (
    <main className="items_list_container">
      <h3>{itemType}</h3>
      <section>
        <span style={{ display: 'flex', margin: '5px' }}>
          {items && (
            <>
              <ToolSelectForm
                items={items}
                setSelectedProject={setSelectedProject}
                setSelectedItem={setSelectedItem}
              />
              <ToolSelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </>
          )}
        </span>
        {filteredItems && (
          <ToolItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
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
      id: PropTypes.number.isRequired,
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

ToolItemListView.defaultProps = {
  errors: {},
};

export default ToolItemListView;

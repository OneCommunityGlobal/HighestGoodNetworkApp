import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
  const [selectedTime, setSelectedTime] = useState(moment().format('YYYY-MM-DD HH:mm:ss'));

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
        <span>
          {items && (
            <div className="select_input">
              <label>Time:</label>
              <input
                type="text"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                placeholder="MM-DD-YYYY HH:MM:SS"
              />
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
            </div>
          )}
          <div className="buttons-row">
            <button type="button" className="btn-primary">
              Add Material
            </button>
            <button type="button" className="btn-primary">
              Edit Name/Measurement
            </button>
            <button type="button" className="btn-primary">
              View Update History
            </button>
          </div>
        </span>
        {filteredItems && (
          <ItemsTable
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

ItemListView.propTypes = {
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

ItemListView.defaultProps = {
  errors: {},
};

ItemListView.defaultProps = {
  errors: {},
};

export default ItemListView;

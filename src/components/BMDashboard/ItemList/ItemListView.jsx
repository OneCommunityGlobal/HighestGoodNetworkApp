import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import styles from './ItemListView.module.css';

export function ItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

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

  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (darkMode && rootElement) {
      rootElement.style.backgroundColor = '#1b2a41';
    } else if (rootElement) {
      rootElement.style.backgroundColor = '#ffffff';
    }

    return () => {
      // Cleanup: restore original background when component unmounts
      if (rootElement) {
        rootElement.style.backgroundColor = '#ffffff';
      }
    };
  }, [darkMode]);

  if (isError) {
    return (
      <div className={darkMode ? styles.pageWrapperDark : styles.pageWrapper}>
        <main
          className={`${styles.itemsListContainer} ${
            darkMode ? styles.itemsListContainerDark : ''
          }`}
        >
          <h2 className={darkMode ? 'text-light' : ''}>
            {itemType}
            {' List'}
          </h2>
          <BMError errors={errors} />
        </main>
      </div>
    );
  }

  return (
    <div className={darkMode ? styles.pageWrapperDark : styles.pageWrapper}>
      <main
        className={`${styles.itemsListContainer} ${darkMode ? styles.itemsListContainerDark : ''}`}
      >
        <h3 className={darkMode ? 'text-light' : ''}>{itemType}</h3>
        <section>
          <span>
            {items && (
              <div
                className={`${styles.selectInput} ${darkMode ? styles.selectInputDark : ''} ${
                  darkMode ? 'dark-mode' : ''
                }`}
              >
                <label htmlFor="itemListTime">Time:</label>
                <DatePicker
                  selected={selectedTime}
                  onChange={date => setSelectedTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm:ss"
                  placeholderText="Select date and time"
                  inputId="itemListTime" // This is the key line
                  className={darkMode ? styles.datePickerDark : ''}
                />
                <SelectForm
                  items={items}
                  setSelectedProject={setSelectedProject}
                  setSelectedItem={setSelectedItem}
                  darkMode={darkMode}
                />
                <SelectItem
                  items={items}
                  selectedProject={selectedProject}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  darkMode={darkMode}
                />
              </div>
            )}
            <div className={`${styles.buttonsRow}`}>
              <button
                type="button"
                className={`${styles.btnPrimary} ${darkMode ? styles.btnPrimaryDark : ''}`}
              >
                Add Material
              </button>
              <button
                type="button"
                className={`${styles.btnPrimary} ${darkMode ? styles.btnPrimaryDark : ''}`}
              >
                Edit Name/Measurement
              </button>
              <button
                type="button"
                className={`${styles.btnPrimary} ${darkMode ? styles.btnPrimaryDark : ''}`}
              >
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
              darkMode={darkMode}
            />
          )}
        </section>
      </main>
    </div>
  );
}

ItemListView.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      itemType: PropTypes.shape({
        name: PropTypes.string,
        unit: PropTypes.string,
      }),
      project: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
      stockAvailable: PropTypes.number,
      stockBought: PropTypes.number,
      stockUsed: PropTypes.number,
      stockWasted: PropTypes.number,
    }),
  ).isRequired,
  errors: PropTypes.shape({
    message: PropTypes.string,
  }),
  itemType: PropTypes.string.isRequired,
  UpdateItemModal: PropTypes.elementType.isRequired,
  dynamicColumns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

ItemListView.defaultProps = {
  errors: {},
};

export default ItemListView;

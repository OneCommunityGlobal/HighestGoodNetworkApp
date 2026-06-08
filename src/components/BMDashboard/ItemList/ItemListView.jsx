import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import styles from './ItemListView.module.css';

export function ItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedProject, setSelectedProject] = useState([]); // Array of strings
  const [selectedItem, setSelectedItem] = useState([]);       // Array of strings
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const darkMode = useSelector(state => state.theme.darkMode);

  // Sync initial items load
  useEffect(() => {
    if (items) setFilteredItems([...items]);
  }, [items]);

  // Unified Filtering Logic (Treats empty arrays as 'unfiltered/show all')
  useEffect(() => {
    if (!items) return;

    const hasProjectFilter = selectedProject.length > 0;
    const hasItemFilter = selectedItem.length > 0;

    let matchedItems = items;

    if (hasProjectFilter && !hasItemFilter) {
      matchedItems = items.filter(item => selectedProject.includes(item.project?.name));
    } else if (!hasProjectFilter && hasItemFilter) {
      matchedItems = items.filter(item => selectedItem.includes(item.itemType?.name));
    } else if (hasProjectFilter && hasItemFilter) {
      matchedItems = items.filter(
        item => selectedProject.includes(item.project?.name) && 
                selectedItem.includes(item.itemType?.name)
      );
    }

    setFilteredItems(matchedItems);
  }, [selectedProject, selectedItem, items]);

  useEffect(() => {
    setIsError(Object.entries(errors || {}).length > 0);
  }, [errors]);

  if (isError) {
    return (
      <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3>{itemType}</h3>
      <section>
        <span>
          {items && (
            <div className={`${styles.selectInput}`}>
              <label htmlFor="itemListTime">Time:</label>
              <DatePicker
                selected={selectedTime}
                onChange={date => setSelectedTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm:ss"
                placeholderText="Select date and time"
                inputId="itemListTime"
                className={darkMode ? styles.darkDatePickerInput : styles.lightDatePickerInput}
                calendarClassName={darkMode ? styles.darkDatePicker : styles.lightDatePicker}
                popperClassName={darkMode ? styles.darkDatePickerPopper : styles.lightDatePickerPopper}
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
                label={itemType}
              />
            </div>
          )}
          <div className={`${styles.buttonsRow}`}>
            <button type="button" className={`${styles.btnPrimary}`}>Add Material</button>
            <button type="button" className={`${styles.btnPrimary}`}>Edit Name/Measurement</button>
            <button type="button" className={`${styles.btnPrimary}`}>View Update History</button>
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
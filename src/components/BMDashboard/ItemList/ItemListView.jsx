import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import UpdateHistoryModal from '../UpdateHistory/UpdateHistoryModal';
import styles from './ItemListView.module.css';

export function ItemListView({
  itemType,
  items,
  errors,
  UpdateItemModal,
  dynamicColumns,
  children,
}) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [updateHistoryModalOpen, setUpdateHistoryModalOpen] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleUpdateHistoryModal = () => {
    setUpdateHistoryModalOpen(prev => !prev);
  };

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
      <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
        <h2>
          {itemType}
          {' List'}
        </h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3>{itemType}</h3>
      <section>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}
        >
          {items && (
            <div
              className={`${styles.selectInput}`}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="itemListTime" style={{ margin: 0 }}>
                  Time:
                </label>
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
                  popperClassName={
                    darkMode ? styles.darkDatePickerPopper : styles.lightDatePickerPopper
                  }
                />
              </div>
              <SelectForm
                items={items}
                setSelectedProject={setSelectedProject}
                setSelectedItem={setSelectedItem}
              />
              {/* <SelectItem
                items={items}
                selectedProject={selectedProject}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem} 
              /> */}
            </div>
          )}
          <div className={`${styles.buttonsRow}`}>
            <button type="button" className={`${styles.btnPrimary}`}>
              Add Material
            </button>
            <button type="button" className={`${styles.btnPrimary}`}>
              Edit Name/Measurement
            </button>
            <button
              type="button"
              className={`${styles.btnPrimary}`}
              onClick={toggleUpdateHistoryModal}
            >
              View Update History
            </button>
          </div>
        </div>

        <UpdateHistoryModal
          isOpen={updateHistoryModalOpen}
          toggle={toggleUpdateHistoryModal}
          itemType={itemType}
          selectedProject={selectedProject}
        />

        {children && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              flexWrap: 'wrap',
              gap: '15px',
              backgroundColor: darkMode ? '#2d2d2d' : '#f8f9fa',
              padding: '12px 15px',
              borderRadius: '6px',
              border: darkMode ? '1px solid #444' : '1px solid #dee2e6',
            }}
          >
            {children}
          </div>
        )}

        {filteredItems && (
          <ItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
            filteredItems={filteredItems}
            UpdateItemModal={UpdateItemModal}
            dynamicColumns={dynamicColumns}
            darkMode={darkMode}
            itemType={itemType}
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
  children: PropTypes.node,
};

ItemListView.defaultProps = {
  errors: {},
  children: null,
};

export default ItemListView;

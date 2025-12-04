// src/components/BMDashboard/ItemList/ItemListView.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import UpdateNameMeasurementModal from './UpdateItemModal';
import styles from './ItemListView.module.css';

export function ItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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
      <main className={styles.itemsListContainer}>
        <h2>
          {itemType}
          {' List'}
        </h2>
        <BMError errors={errors} />
      </main>
    );
  }

  const handleOpenUpdateModal = () => setIsUpdateModalOpen(true);
  const handleCloseUpdateModal = () => setIsUpdateModalOpen(false);

  const handleSubmitUpdate = ({ id, field, value }) => {
    console.log('Update item request', { id, field, value });
    setIsUpdateModalOpen(false);
  };

  return (
    <main className={styles.itemsListContainer}>
      <h3>{itemType}</h3>
      <section>
        <span>
          {items && (
            <div className={styles.selectInput}>
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
          <div className={styles.buttonsRow}>
            <button type="button" className={styles.btnPrimary}>
              Add Material
            </button>
            <button type="button" className={styles.btnPrimary} onClick={handleOpenUpdateModal}>
              Edit Name/Measurement
            </button>
            <button type="button" className={styles.btnPrimary}>
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

        <UpdateNameMeasurementModal
          isOpen={isUpdateModalOpen}
          onClose={handleCloseUpdateModal}
          onSubmit={handleSubmitUpdate}
        />
      </section>
    </main>
  );
}

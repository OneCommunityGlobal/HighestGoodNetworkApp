import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import MaterialSummaryPanel from '../MaterialList/MaterialSummaryPanel';
import styles from './ItemListView.module.css';

export function ItemListView({
  itemType,
  items,
  errors,
  UpdateItemModal,
  dynamicColumns,
  children,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const isMaterialsView = itemType === 'Materials';

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
      <main className={`${styles.items_list_container} ${darkMode ? 'dark-mode dm-text' : ''}`}>
        <h2 className={darkMode ? 'dm-text' : ''}>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.items_list_container} ${darkMode ? 'dark-mode dm-text' : ''}`}>
      <h3 className={darkMode ? 'dm-text dm-heading' : ''}>{itemType}</h3>

      <section className={darkMode ? 'dm-bg dm-border dm-section-solid' : ''}>
        <span
          style={{ display: 'flex', margin: '5px' }}
          className={darkMode ? 'dm-bg dm-filter-contrast dm-border dm-text' : ''}
        >
          {items && (
            <>
              <DatePicker
                selected={selectedTime}
                onChange={date => setSelectedTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm:ss"
                placeholderText="Select date and time"
                className={darkMode ? 'form-control bg-yinmn-blue text-light' : 'form-control'}
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
                label={isMaterialsView ? 'Material' : itemType}
                darkMode={darkMode}
              />
            </>
          )}
        </span>

        {children}

        {filteredItems && (
          <>
            {isMaterialsView && (
              <MaterialSummaryPanel materials={filteredItems} darkMode={darkMode} />
            )}
            <ItemsTable
              selectedProject={selectedProject}
              selectedItem={selectedItem}
              filteredItems={filteredItems}
              UpdateItemModal={UpdateItemModal}
              dynamicColumns={dynamicColumns}
              darkMode={darkMode}
              itemType={itemType}
            />
          </>
        )}
      </section>
    </main>
  );
}

ItemListView.propTypes = {
  itemType: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
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
      stockHold: PropTypes.number,
      productId: PropTypes.string,
    }),
  ).isRequired,
  errors: PropTypes.shape({
    message: PropTypes.string,
  }),
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

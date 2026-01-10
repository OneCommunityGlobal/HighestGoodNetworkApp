import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectItem from './SelectItem';
import ItemsTable from './ItemsTable';
import styles from './ItemListView.module.css';
import { Form, FormGroup, Label } from 'reactstrap';
import AddMaterialModal from '../AddMaterial/AddMaterialModal';
import { fetchMaterialTypes } from '../../../actions/bmdashboard/invTypeActions';

export function ItemListView({ itemType, items, errors, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const materialTypes = useSelector(state => state.bmInvTypes.list);
  const [isAMOpen, setisAMOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedToolStatus, setSelectedToolStatus] = useState('all');

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
    if (itemType === 'Materials') dispatch(fetchMaterialTypes());
  }, [dispatch, itemType]);
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

  function openAddModal() {
    if (itemType === 'Materials') {
      setisAMOpen(true);
    }
  }
  return (
    <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h3>{itemType}</h3>
      <section>
        <span>
          {items && (
            <div className={`${styles.dropdownRow}`}>
              <Form>
                <FormGroup className={styles.datePickerGroup}>
                  <Label htmlFor="itemListTime">Time:</Label>
                  <DatePicker
                    selected={selectedTime}
                    onChange={date => setSelectedTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm:ss"
                    placeholderText="Select date and time"
                    id="itemListTime"
                    inputId="itemListTime" // This is the key line
                    className={darkMode ? styles.darkDatePickerInput : styles.lightDatePickerInput}
                    calendarClassName={darkMode ? styles.darkDatePicker : styles.lightDatePicker}
                    popperClassName={
                      darkMode ? styles.darkDatePickerPopper : styles.lightDatePickerPopper
                    }
                  />
                </FormGroup>
              </Form>

              <SelectForm
                items={items}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                setSelectedItem={setSelectedItem}
                setSelectedCondition={setSelectedCondition}
                setSelectedToolStatus={setSelectedToolStatus}
              />
              <SelectItem
                items={materialTypes}
                selectedItem={selectedItem}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                label={itemType}
              />
            </div>
          )}
          <div className={`${styles.buttonsRow}`}>
            <button type="button" className={`${styles.btnPrimary}`} onClick={openAddModal}>
              Add {itemType}
            </button>
            <button type="button" className={`${styles.btnPrimary}`}>
              Edit Name/Measurement
            </button>
            <button type="button" className={`${styles.btnPrimary}`}>
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
      <section>
        <AddMaterialModal isAMOpen={isAMOpen} toggle={() => setisAMOpen(false)} />
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

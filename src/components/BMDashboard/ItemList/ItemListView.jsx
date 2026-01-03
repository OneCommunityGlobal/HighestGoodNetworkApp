import { useState, useEffect, useMemo } from 'react';
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
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [isError, setIsError] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const darkMode = useSelector(state => state.theme.darkMode);

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
    setCurrentPage(1);
  }, [searchQuery, selectedProject, selectedItem, rowsPerPage]);

  const normalize = v =>
    String(v ?? '')
      .toLowerCase()
      .trim();

  const searchFilteredItems = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return filteredItems || [];

    return (filteredItems || []).filter(item => {
      const project = normalize(item.project?.name);
      const name = normalize(item.itemType?.name || item.name);
      const pid = normalize(item['product id'] ?? item.productId ?? item.pid);
      const measurement = normalize(item.itemType?.unit);

      return project.includes(q) || name.includes(q) || pid.includes(q) || measurement.includes(q);
    });
  }, [filteredItems, searchQuery]);

  const getSortValue = (item, key) => {
    switch (key) {
      case 'project':
        return item.project?.name || '';
      case 'name':
        return item.itemType?.name || item.name || '';
      case 'bought':
        return item.stockBought ?? 0;
      case 'used':
        return item.stockUsed ?? 0;
      case 'available':
        return item.stockAvailable ?? 0;
      case 'wasted':
        return item.stockWasted ?? 0;
      case 'hold':
        return item.stockHold ?? 0;
      default:
        return '';
    }
  };

  const compare = (a, b, direction) => {
    const dir = direction === 'asc' ? 1 : -1;

    if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;

    const sa = String(a ?? '').toLowerCase();
    const sb = String(b ?? '').toLowerCase();
    return sa.localeCompare(sb) * dir;
  };

  const sortedItems = useMemo(() => {
    const arr = (searchFilteredItems || []).map((item, idx) => ({ item, idx }));

    if (!sortConfig.key) return arr.map(x => x.item);

    arr.sort((x, y) => {
      const va = getSortValue(x.item, sortConfig.key);
      const vb = getSortValue(y.item, sortConfig.key);
      const c = compare(va, vb, sortConfig.direction);
      return c !== 0 ? c : x.idx - y.idx;
    });

    return arr.map(x => x.item);
  }, [searchFilteredItems, sortConfig]);

  const handleSort = key => {
    setSortConfig(prev => {
      if (prev.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  useEffect(() => {
    setCurrentPage(p => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, currentPage, rowsPerPage]);

  const startRow = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRow = Math.min(currentPage * rowsPerPage, totalItems);

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
                popperClassName={
                  darkMode ? styles.darkDatePickerPopper : styles.lightDatePickerPopper
                }
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

          <div className={`${styles.buttonsRow}`}>
            <button type="button" className={`${styles.btnPrimary}`}>
              Add Material
            </button>
            <button type="button" className={`${styles.btnPrimary}`}>
              Edit Name/Measurement
            </button>
            <button type="button" className={`${styles.btnPrimary}`}>
              View Update History
            </button>
          </div>
        </span>

        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <label htmlFor="globalSearch">Search:</label>
            <input
              id="globalSearch"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project, name, PID, or measurement..."
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.foundCount}>
            {totalItems} {totalItems === 1 ? 'material' : 'materials'} found
          </div>
        </div>

        {filteredItems && (
          <ItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
            filteredItems={paginatedItems}
            UpdateItemModal={UpdateItemModal}
            dynamicColumns={dynamicColumns}
            darkMode={darkMode}
            sortConfig={sortConfig}
            onSort={handleSort}
            totalItems={totalItems}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            startRow={startRow}
            endRow={endRow}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
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
      stockHold: PropTypes.number,
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

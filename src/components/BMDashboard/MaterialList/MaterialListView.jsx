import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';
import RecordsModal from '../ItemList/RecordsModal';
import SelectForm from '../ItemList/SelectForm';
import SelectItem from '../ItemList/SelectItem';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, Button, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { BiPencil, BiX } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import styles from '../ItemList/ItemListView.module.css';

function MaterialListView() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials.materialslist);
  const errors = useSelector(state => state.errors);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  // Transform the materials to match expected PropTypes
  const transformedMaterials =
    materials?.map(material => ({
      ...material,
      id: parseInt(material._id?.split('-')[0], 16) || Math.random(), // Convert first part of _id to number or use random fallback
      name: material.itemType?.name || 'Unnamed Material',
    })) || [];

  // New state for search, sort, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Previous state for filters
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedItem, setSelectedItem] = useState('all');
  const [selectedTime, setSelectedTime] = useState(new Date());

  // New state for redesign
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [activeRowMenu, setActiveRowMenu] = useState(null);

  // Modals state
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [recordsModal, setRecordsModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (postMaterialUpdateResult?.result !== null && !postMaterialUpdateResult.loading) {
      if (!postMaterialUpdateResult.error) {
        dispatch(fetchAllMaterials());
        dispatch(resetMaterialUpdate());
      }
    }
  }, [postMaterialUpdateResult, dispatch]);

  // Update lastRefreshed when materials change
  useEffect(() => {
    if (materials) {
      setLastRefreshed(new Date());
    }
  }, [materials]);

  // Reset pageIndex when search or pageSize changes
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, pageSize]);

  // Reset sort when filters change
  useEffect(() => {
    setSortKey(null);
    setSortDir('asc');
  }, [selectedProject, selectedItem]);

  // Data processing pipeline
  const originalData = transformedMaterials;

  // First, filter by selectedProject and selectedItem
  let projectItemFiltered = originalData;
  if (selectedProject !== 'all' || selectedItem !== 'all') {
    if (selectedProject !== 'all' && selectedItem === 'all') {
      projectItemFiltered = originalData.filter(item => item.project?.name === selectedProject);
    } else if (selectedProject === 'all' && selectedItem !== 'all') {
      projectItemFiltered = originalData.filter(item => item.itemType?.name === selectedItem);
    } else {
      projectItemFiltered = originalData.filter(
        item => item.project?.name === selectedProject && item.itemType?.name === selectedItem,
      );
    }
  }

  // Then, filter by global search
  const filteredData = projectItemFiltered.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const project = (item.project?.name || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const pid = (item['product id'] || '').toLowerCase();
    const measurement = (item.itemType?.unit || '').toLowerCase();
    return (
      project.includes(query) ||
      name.includes(query) ||
      pid.includes(query) ||
      measurement.includes(query)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal, bVal;
    if (sortKey === 'name') {
      aVal = a.name || '';
      bVal = b.name || '';
    } else if (sortKey === 'project') {
      aVal = a.project?.name || '';
      bVal = b.project?.name || '';
    } else {
      aVal = Number(a[sortKey]) || 0;
      bVal = Number(b[sortKey]) || 0;
    }
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const total = sortedData.length;
  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, total);
  const pagedData = sortedData.slice(start, end);
  const totalPages = Math.ceil(total / pageSize);

  // Summary totals from filteredData
  const totalBought = filteredData.reduce((sum, item) => sum + (Number(item.stockBought) || 0), 0);
  const totalUsed = filteredData.reduce((sum, item) => sum + (Number(item.stockUsed) || 0), 0);
  const totalAvailable = filteredData.reduce(
    (sum, item) => sum + (Number(item.stockAvailable) || 0),
    0,
  );
  const totalWasted = filteredData.reduce((sum, item) => sum + (Number(item.stockWasted) || 0), 0);

  // Clamp pageIndex
  useEffect(() => {
    if (pageIndex >= totalPages && totalPages > 0) {
      setPageIndex(totalPages - 1);
    }
  }, [totalPages, pageIndex]);

  const handleSort = key => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getSortIcon = key => {
    if (sortKey !== key) return faSort;
    return sortDir === 'asc' ? faSortUp : faSortDown;
  };

  const handleViewRecordsClick = (data, type) => {
    setRecordsModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedProject('all');
    setSelectedItem('all');
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
  };

  const toggleRowMenu = id => {
    setActiveRowMenu(activeRowMenu === id ? null : id);
  };

  const handleEditUpdate = el => {
    setUpdateModal(true);
    setUpdateRecord(el);
    setActiveRowMenu(null);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const itemType = 'Materials';

  const dynamicColumns = [
    { label: 'PID', key: 'product id' },
    { label: 'Measurement', key: 'itemType.unit' },
    { label: 'Bought', key: 'stockBought' },
    { label: 'Used', key: 'stockUsed' },
    { label: 'Available', key: 'stockAvailable' },
    { label: 'Wasted', key: 'stockWasted' },
    { label: 'Hold', key: 'stockHold' },
  ];

  const sortKeys = {
    Project: 'project',
    Name: 'name',
    PID: 'product id',
    Measurement: 'itemType.unit',
    Bought: 'stockBought',
    Used: 'stockUsed',
    Available: 'stockAvailable',
    Wasted: 'stockWasted',
    Hold: 'stockHold',
  };

  if (Object.entries(errors).length > 0) {
    return (
      <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
        <h2>Materials List</h2>
        <div>Errors: {JSON.stringify(errors)}</div>
      </main>
    );
  }

  return (
    <main className={`${styles.itemsListContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="titleSection">
          <h3>Materials</h3>
          <div className={styles.subtitle}>Track inventory, usage, and waste by project.</div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={`${styles.btnPrimary} ${styles.uniformControl}`}>
            + Add Material
          </button>
          <div className={styles.moreMenu}>
            <button onClick={toggleMoreMenu} className={styles.uniformControl}>
              ⋯
            </button>
            {moreMenuOpen && (
              <div className={styles.menu}>
                <button
                  onClick={() => {
                    /* Edit Name/Measurement handler */ setMoreMenuOpen(false);
                  }}
                  className={styles.uniformControl}
                >
                  Edit Name/Measurement
                </button>
                <button
                  onClick={() => {
                    /* View Update History handler */ setMoreMenuOpen(false);
                  }}
                  className={styles.uniformControl}
                >
                  View Update History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className="searchGroup" style={{ flex: 2, minWidth: '400px' }}>
            <div
              style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}
            >
              <InputGroup style={{ flex: 1 }}>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>Search</InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder="Search by project, name, PID, measurement..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.uniformControl}
                />
                {searchQuery && (
                  <InputGroupAddon addonType="append">
                    <Button onClick={() => setSearchQuery('')} className={styles.uniformControl}>
                      <BiX />
                    </Button>
                  </InputGroupAddon>
                )}
              </InputGroup>
              <Button
                onClick={handleResetFilters}
                color="secondary"
                className={styles.uniformControl}
              >
                Reset
              </Button>
            </div>
            <div>
              <DatePicker
                aria-label="Time"
                selected={selectedTime}
                onChange={date => setSelectedTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm:ss"
                placeholderText="Select date and time"
                className={`${
                  darkMode ? styles.darkDatePickerInput : styles.lightDatePickerInput
                } ${styles.uniformControl}`}
                calendarClassName={darkMode ? styles.darkDatePicker : styles.lightDatePicker}
                popperClassName={
                  darkMode ? styles.darkDatePickerPopper : styles.lightDatePickerPopper
                }
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1px' }}>
              <div>
                <SelectForm
                  items={originalData}
                  setSelectedProject={setSelectedProject}
                  setSelectedItem={setSelectedItem}
                />
              </div>
              <div>
                <SelectItem
                  items={originalData}
                  selectedProject={selectedProject}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.metaRow}>
          <div>Last refreshed: {lastRefreshed.toLocaleString()}</div>
          <div>Showing {filteredData.length} results</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className="value">{totalBought}</div>
          <div className="label">Total Bought</div>
        </div>
        <div className={styles.summaryCard}>
          <div className="value">{totalUsed}</div>
          <div className="label">Total Used</div>
        </div>
        <div className={styles.summaryCard}>
          <div className="value">{totalAvailable}</div>
          <div className="label">Total Available</div>
        </div>
        <div className={styles.summaryCard}>
          <div className="value">{totalWasted}</div>
          <div className="label">Total Wasted</div>
        </div>
      </div>

      <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table className={darkMode ? styles.darkTable : ''}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: darkMode ? '#333' : '#fff',
              zIndex: 1,
            }}
          >
            <tr>
              {Object.entries(sortKeys).map(([label, key]) => (
                <th key={label} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                  {label} <FontAwesomeIcon icon={getSortIcon(key)} size="lg" />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length > 0 ? (
              pagedData.map(el => (
                <tr key={el._id}>
                  <td>{el.project?.name}</td>
                  <td>{el.name}</td>
                  <td>{el['product id']}</td>
                  <td>{el.itemType?.unit}</td>
                  <td>{el.stockBought}</td>
                  <td>{el.stockUsed}</td>
                  <td>{el.stockAvailable}</td>
                  <td>{el.stockWasted}</td>
                  <td>{el.stockHold}</td>
                  <td className={styles.actionsCell}>
                    <div className={styles.rowMenu}>
                      <button
                        onClick={() => toggleRowMenu(el._id)}
                        className={styles.uniformControl}
                      >
                        ⋯
                      </button>
                      {activeRowMenu === el._id && (
                        <div className={styles.menu}>
                          <button
                            onClick={() => {
                              handleViewRecordsClick(el, 'UsageRecord');
                              setActiveRowMenu(null);
                            }}
                            className={styles.uniformControl}
                          >
                            View Usage
                          </button>
                          <button
                            onClick={() => handleEditUpdate(el)}
                            className={styles.uniformControl}
                          >
                            Edit/View Updates
                          </button>
                          <button
                            onClick={() => {
                              handleViewRecordsClick(el, 'Purchase');
                              setActiveRowMenu(null);
                            }}
                            className={styles.uniformControl}
                          >
                            View Purchases
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center' }}>
                  No items data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '15px',
          padding: '10px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          background: darkMode ? '#1f2937' : '#f9fafb',
        }}
      >
        <div>
          <label htmlFor="pageSizeSelect">Page Size: </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className={styles.uniformControl}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div>
          Showing {start + 1}–{end} of {total}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <Button
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(0)}
            size="sm"
            className={styles.uniformControl}
          >
            First
          </Button>
          <Button
            disabled={pageIndex === 0}
            onClick={() => setPageIndex(pageIndex - 1)}
            size="sm"
            className={styles.uniformControl}
          >
            Prev
          </Button>
          <Button
            disabled={pageIndex >= totalPages - 1}
            onClick={() => setPageIndex(pageIndex + 1)}
            size="sm"
            className={styles.uniformControl}
          >
            Next
          </Button>
          <Button
            disabled={pageIndex >= totalPages - 1}
            onClick={() => setPageIndex(totalPages - 1)}
            size="sm"
            className={styles.uniformControl}
          >
            Last
          </Button>
        </div>
      </div>

      <UpdateMaterialModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <RecordsModal
        modal={recordsModal}
        setModal={setRecordsModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
      />
    </main>
  );
}

export default MaterialListView;

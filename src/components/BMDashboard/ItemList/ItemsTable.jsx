import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';

import RecordsModal from './RecordsModal';
import MaterialUsageChart from '../MaterialUsage/MaterialUsageChart';
import StockHealthIndicator from '../MaterialList/StockHealthIndicator';
import UsagePercentageBar from '../MaterialList/UsagePercentageBar';
import styles from './ItemListView.module.css';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
  itemType,
}) {
  const [sortedData, setData] = useState(filteredItems);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartProjectId, setChartProjectId] = useState(null);
  const [projectNameCol, setProjectNameCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });
  const [inventoryItemTypeCol, setInventoryItemTypeCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });

  const isMaterialsView = itemType === 'Materials';

  useEffect(() => {
    setData(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    setInventoryItemTypeCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    setProjectNameCol({ iconsToDisplay: faSort, sortOrder: 'default' });
  }, [selectedProject, selectedItem]);

  const handleEditRecordsClick = (selectedEl, type) => {
    if (type === 'Update') {
      setUpdateModal(true);
      setUpdateRecord(selectedEl);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    if (type === 'UsageRecord') {
      const projectId = data.project?._id || data.projectId;

      if (projectId) {
        setChartProjectId(projectId);
        setShowChartModal(true);
        return;
      }
    }

    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const sortData = columnName => {
    const newSortedData = [...sortedData];

    if (columnName === 'ProjectName') {
      if (projectNameCol.sortOrder === 'default' || projectNameCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.project?.name || '').localeCompare(b.project?.name || ''));
        setProjectNameCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else if (projectNameCol.sortOrder === 'asc') {
        newSortedData.sort((a, b) => (b.project?.name || '').localeCompare(a.project?.name || ''));
        setProjectNameCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }

      setInventoryItemTypeCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    } else if (columnName === 'InventoryItemType') {
      if (
        inventoryItemTypeCol.sortOrder === 'default' ||
        inventoryItemTypeCol.sortOrder === 'desc'
      ) {
        newSortedData.sort((a, b) =>
          (a.itemType?.name || '').localeCompare(b.itemType?.name || ''),
        );
        setInventoryItemTypeCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else if (inventoryItemTypeCol.sortOrder === 'asc') {
        newSortedData.sort((a, b) =>
          (b.itemType?.name || '').localeCompare(a.itemType?.name || ''),
        );
        setInventoryItemTypeCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }

      setProjectNameCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    }

    setData(newSortedData);
  };

  const getNestedValue = (obj, path) => {
    if (!path) return null;
    if (path === 'product id') return obj.productId ?? 'N/A';
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const emptyStateColSpan = 4 + dynamicColumns.length + (isMaterialsView ? 3 : 0);

  return (
    <>
      <RecordsModal
        modal={modal}
        setModal={setModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
        itemType={itemType}
      />
      {showChartModal && chartProjectId && (
        <MaterialUsageChart projectId={chartProjectId} toggle={() => setShowChartModal(false)} />
      )}
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />

      {darkMode && (
        <style>
          {`
            .dark-mode .items_table_container .table thead th {
              background-color: #1C2541 !important;
              color: #ffffff !important;
              border-color: #555 !important;
            }

            .dark-mode .items_table_container .table thead tr {
              background-color: #1C2541 !important;
            }

            .dark-mode .items_table_container .table tbody tr:hover {
              background-color: #1C2541 !important;
            }
          `}
        </style>
      )}

      <div
        className={`${styles.items_table_container} ${
          darkMode ? 'items_table_container_dark dark-mode' : ''
        }`}
        style={darkMode ? { backgroundColor: '#3A506B' } : {}}
      >
        <Table
          className={darkMode ? 'dark-table' : ''}
          style={
            darkMode ? { backgroundColor: '#3A506B', color: '#ffffff', borderColor: '#444' } : {}
          }
        >
          <thead
            className={darkMode ? 'dark-thead' : ''}
            style={darkMode ? { backgroundColor: '#1C2541', color: '#ffffff' } : {}}
          >
            <tr style={darkMode ? { backgroundColor: '#1C2541' } : {}}>
              {selectedProject === 'all' ? (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  onClick={() => sortData('ProjectName')}
                >
                  Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Project
                </th>
              )}
              {selectedItem === 'all' ? (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  onClick={() => sortData('InventoryItemType')}
                >
                  Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Name
                </th>
              )}
              {dynamicColumns.map(({ label, key }) => (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  key={key}
                >
                  {label}
                </th>
              ))}
              {isMaterialsView && (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Usage %
                </th>
              )}
              {isMaterialsView && (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Stock Health
                </th>
              )}
              {isMaterialsView && (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Usage Record
                </th>
              )}
              <th
                className={darkMode ? 'dark-th' : ''}
                style={
                  darkMode
                    ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                    : {}
                }
              >
                Updates
              </th>
              <th
                className={darkMode ? 'dark-th' : ''}
                style={
                  darkMode
                    ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                    : {}
                }
              >
                Purchases
              </th>
            </tr>
          </thead>

          <tbody
            className={darkMode ? 'dark-tbody' : ''}
            style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
          >
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => (
                <tr
                  key={el._id}
                  className={darkMode ? 'dark-row' : ''}
                  style={
                    darkMode ? { backgroundColor: '#3A506B', borderBottom: '1px solid #333' } : {}
                  }
                >
                  <td style={darkMode ? { color: '#ffffff' } : {}}>{el.project?.name}</td>
                  <td style={darkMode ? { color: '#ffffff' } : {}}>{el.itemType?.name}</td>
                  {dynamicColumns.map(({ label, key }) => (
                    <td key={label} style={darkMode ? { color: '#ffffff' } : {}}>
                      {getNestedValue(el, key) ?? 'N/A'}
                    </td>
                  ))}
                  {isMaterialsView && (
                    <td style={darkMode ? { color: '#ffffff' } : {}}>
                      <UsagePercentageBar material={el} darkMode={darkMode} />
                    </td>
                  )}
                  {isMaterialsView && (
                    <td style={darkMode ? { color: '#ffffff' } : {}}>
                      <StockHealthIndicator material={el} darkMode={darkMode} />
                    </td>
                  )}
                  {isMaterialsView && (
                    <td style={darkMode ? { color: '#ffffff' } : {}}>
                      <Button
                        color="primary"
                        outline={!darkMode}
                        style={darkMode ? { borderColor: '#4a90e2', color: '#ffffff' } : {}}
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'UsageRecord')}
                      >
                        View
                      </Button>
                    </td>
                  )}
                  <td className={styles.items_cell}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'nowrap',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <button
                        type="button"
                        style={darkMode ? { color: '#4a90e2' } : {}}
                        onClick={() => handleEditRecordsClick(el, 'Update')}
                        aria-label="Edit Record"
                      >
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline={!darkMode}
                        style={darkMode ? { borderColor: '#4a90e2', color: '#ffffff' } : {}}
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'Update')}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Button
                      color="primary"
                      outline={!darkMode}
                      style={darkMode ? { borderColor: '#4a90e2', color: '#ffffff' } : {}}
                      size="sm"
                      onClick={() => handleViewRecordsClick(el, 'Purchase')}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={emptyStateColSpan} style={{ textAlign: 'center' }}>
                  No items data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}

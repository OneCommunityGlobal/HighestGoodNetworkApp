import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import RecordsModal from './RecordsModal';
import styles from './ItemListView.module.css';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
}) {
  const [sortedData, setData] = useState(filteredItems);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [projectNameCol, setProjectNameCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });
  const [inventoryItemTypeCol, setInventoryItemTypeCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });

  const [boughtCol, setBoughtCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });
  const [usedCol, setUsedCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });
  const [availableCol, setAvailableCol] = useState({
    iconsToDisplay: faSort,
  });
  const [wastedCol, setWastedCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });

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
    // Sorting for Bought
    if (columnName === 'Bought') {
      if (boughtCol.sortOrder === 'default' || boughtCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockBought || 0) - (b.stockBought || 0));
        setBoughtCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockBought || 0) - (a.stockBought || 0));
        setBoughtCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Bought');
    }

    // Sorting for Used
    if (columnName === 'Used') {
      if (usedCol.sortOrder === 'default' || usedCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockUsed || 0) - (b.stockUsed || 0));
        setUsedCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockUsed || 0) - (a.stockUsed || 0));
        setUsedCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Used');
    }

    // Sorting for Available
    if (columnName === 'Available') {
      if (availableCol.sortOrder === 'default' || availableCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockAvailable || 0) - (b.stockAvailable || 0));
        setAvailableCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockAvailable || 0) - (a.stockAvailable || 0));
        setAvailableCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Available');
    }

    // Sorting for Wasted
    if (columnName === 'Wasted') {
      if (wastedCol.sortOrder === 'default' || wastedCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockWasted || 0) - (b.stockWasted || 0));
        setWastedCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockWasted || 0) - (a.stockWasted || 0));
        setWastedCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Wasted');
    }
    setData(newSortedData);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const resetOtherDynamicColumns = active => {
    if (active !== 'Bought') setBoughtCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Used') setUsedCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Available') setAvailableCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Wasted') setWastedCol({ iconsToDisplay: faSort, sortOrder: 'default' });
  };

  return (
    <>
      <RecordsModal
        modal={modal}
        setModal={setModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
      />
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className={`${styles.itemsTableContainer}`}>
        <Table>
          <thead>
            <tr>
              {selectedProject === 'all' ? (
                <th onClick={() => sortData('ProjectName')}>
                  Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th>Project</th>
              )}
              {selectedItem === 'all' ? (
                <th onClick={() => sortData('InventoryItemType')}>
                  Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th>Name</th>
              )}
              {dynamicColumns.map(({ label }) => {
                const stateMap = {
                  Bought: boughtCol,
                  Used: usedCol,
                  Available: availableCol,
                  Wasted: wastedCol,
                };

                return (
                  <th key={label} onClick={() => sortData(label)}>
                    {label}{' '}
                    <FontAwesomeIcon icon={stateMap[label]?.iconsToDisplay || faSort} size="lg" />
                  </th>
                );
              })}
              <th>Usage Record</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>

          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => {
                return (
                  <tr key={el._id}>
                    <td>{el.project?.name}</td>
                    <td>{el.itemType?.name}</td>
                    {dynamicColumns.map(({ label, key }) => (
                      <td key={label}>{getNestedValue(el, key)}</td>
                    ))}
                    <td className={`${styles.itemsCell}`}>
                      <button
                        type="button"
                        onClick={() => handleEditRecordsClick(el, 'UsageRecord')}
                        aria-label="Edit Record"
                      >
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'UsageRecord')}
                      >
                        View
                      </Button>
                    </td>
                    <td className={`${styles.itemsCell}`}>
                      <button
                        type="button"
                        onClick={() => handleEditRecordsClick(el, 'Update')}
                        aria-label="Edit Record"
                      >
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'Update')}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'Purchase')}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center' }}>
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

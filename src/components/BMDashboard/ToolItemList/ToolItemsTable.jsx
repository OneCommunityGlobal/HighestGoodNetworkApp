import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import ToolRecordsModal from './ToolRecordsModal';

export default function ToolItemsTable({
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

    setData(newSortedData);
  };

  return (
    <>
      <ToolRecordsModal
        modal={modal}
        setModal={setModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
      />
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className="items_table_container">
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
              {dynamicColumns.map(({ label }) => (
                <th key={label}>{label}</th>
              ))}
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
                    <td>{el.purchaseStatus === 'Purchased' ? 'Yes' : 'No'}</td>
                    <td>
                      {el.itemType?.using?.includes(el._id) ? (
                        <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} size="lg" color="red" />
                      )}
                    </td>
                    <td>
                      {el.itemType?.available?.includes(el._id) &&
                      el.condition !== 'Lost' &&
                      el.condition !== 'Needs Replacing' ? (
                        <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} size="lg" color="red" />
                      )}
                    </td>
                    <td>
                      <div className="condition_cell">
                        {el.condition === 'Lost' ||
                        el.condition === 'Needs Replacing' ||
                        el.condition === 'Worn' ||
                        el.condition === 'Needs Repair' ? (
                          <FontAwesomeIcon icon={faTimes} size="lg" color="red" />
                        ) : (
                          <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
                        )}
                        {el.condition}
                      </div>
                    </td>
                    <td>{el.code}</td>
                    <td className="items_cell">
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
                        onClick={() => handleViewRecordsClick(el.purchaseRecord, 'Purchase')}
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

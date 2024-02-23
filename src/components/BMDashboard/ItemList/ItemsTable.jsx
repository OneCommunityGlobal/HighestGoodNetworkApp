import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import RecordsModal from './RecordsModal';

export default function ItemsTable({ filteredItems, UpdateItemModal, resetItemUpdate, dynamicColumns }) {
  const dispatch = useDispatch();
  const [sortedData, setData] = useState(null);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [order, setOrder] = useState('default');
  const [iconToDisplay, setIconToDisplay] = useState(faSort);

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc ? acc[part] : undefined, obj);
  }

  useEffect(() => {
    if (filteredItems && filteredItems.length > 0) {
      setData(filteredItems);
    }
  }, [filteredItems]);

  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);

  const handleEditRecordsClick = (selectedItem, type) => {
    if (type === 'Update') {
      dispatch(resetItemUpdate());
      setUpdateModal(true);
      setUpdateRecord(selectedItem);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const sortingAsc = columnName => {
    let sorted = [];
    if (columnName === 'ProjectName') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.project?.name >= b.project?.name ? 1 : -1));
    } else if (columnName === 'InventoryItemType') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.itemType?.name >= b.itemType?.name ? 1 : -1));
    }

    setData(sorted);
    setOrder('asc');
    setIconToDisplay(faSortUp);
  };

  const sortingDesc = columnName => {
    let sorted = [];
    if (columnName === 'ProjectName') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.project?.name <= b.project?.name ? 1 : -1));
    } else if (columnName === 'InventoryItemType') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.itemType?.name <= b.itemType?.name ? 1 : -1));
    }

    setData(sorted);
    setOrder('desc');
    setIconToDisplay(faSortDown);
  };

  const doSorting = columnName => {
    if (order === 'desc') {
      setData(filteredItems);
      setIconToDisplay(faSort);
      setOrder('default');
    } else if (order === 'asc') {
      sortingDesc(columnName);
    } else {
      sortingAsc(columnName);
    }
  };

  return (
    <>
      <RecordsModal modal={modal} setModal={setModal} record={record} setRecord={setRecord} recordType={recordType} />
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className="materials_table_container">
        <Table>
          <thead>
            <tr>
              <th onClick={() => doSorting('ProjectName')}>
                Project <FontAwesomeIcon icon={iconToDisplay} size="lg" />
              </th>
              <th onClick={() => doSorting('InventoryItemType')}>
                Name <FontAwesomeIcon icon={iconToDisplay} size="lg" />
              </th>
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
                    {dynamicColumns.map(({ label, key }) => (
                      <td key={label}>{getNestedValue(el, key)}</td>
                    ))}
                    <td className="materials_cell">
                      <button type="button" onClick={() => handleEditRecordsClick(el, 'Update')}>
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

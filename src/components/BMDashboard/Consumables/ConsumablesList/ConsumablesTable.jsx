import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import './Consumables.css';
import ReactTooltip from 'react-tooltip';
import { fetchAllConsumables } from 'actions/bmdashboard/consumableActions';
import ConsumablesViewModal from './ConsumablesViewModal';

function ConsumablesTable({ consumable, project }) {
  const dispatch = useDispatch();
  const consumables = useSelector(state => state.bmConsumables.consumableslist);
  const [recordType, setRecordType] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState({ project: 'asc', itemType: 'asc' });
  const [iconToDisplay, setIconToDisplay] = useState({ project: faSortUp, itemType: faSortUp });
  const [consumablesViewData, setConsumablesViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchAllConsumables());
  }, []);

  useEffect(() => {
    setConsumablesViewData(consumables);
  }, [consumables]);

  const handleSort = column => {
    if (!column || consumables.length === 0) {
      return;
    }

    if (project.value !== '0' && column === 'project') {
      return;
    }

    const filteredConsumables =
      project.value !== '0'
        ? consumables.filter(rec => rec.project?._id === project.value)
        : consumables;

    const newSortOrder = sortOrder[column] === 'asc' ? 'desc' : 'asc';
    setSortOrder(prevOrder => ({ ...prevOrder, [column]: newSortOrder }));

    const newIcon = iconToDisplay[column] === faSortUp ? faSortDown : faSortUp;
    setIconToDisplay(prevIcons => ({ ...prevIcons, [column]: newIcon }));

    const factor = newSortOrder === 'asc' ? 1 : -1;
    const sortedConsumables = filteredConsumables.sort((a, b) => {
      const nameA = a[column]?.name || '';
      const nameB = b[column]?.name || '';
      return factor * nameA.localeCompare(nameB);
    });

    setConsumablesViewData(sortedConsumables);
  };

  const handleOpenModal = (row, type) => {
    setSelectedRow(row);
    setRecordType(type);
    setModal(true);
  };

  useEffect(() => {
    let filteredConsumables = consumables;
    if (project.value !== '0') {
      filteredConsumables = filteredConsumables.filter(rec => rec.project?._id === project.value);
    }
    if (consumable.value !== '0') {
      filteredConsumables = filteredConsumables.filter(
        rec => rec.itemType?.name === consumable.value,
      );
    }
    setConsumablesViewData([...filteredConsumables]);
  }, [project, consumable, consumables]);

  function conditionalProjectTableHeaderUI() {
    const isSortingAllowed = project.value === '0';
    const sortOrderTooltip = isSortingAllowed
      ? `Sort project ${sortOrder.project === 'asc' ? 'desc' : 'asc'}`
      : undefined;
    return (
      <th onClick={isSortingAllowed ? () => handleSort('project') : undefined}>
        <div
          data-tip={sortOrderTooltip}
          className={`d-flex align-items-stretch ${isSortingAllowed ? 'cursor-pointer' : ''}`}
        >
          <div>Project</div>
          {isSortingAllowed && <FontAwesomeIcon icon={iconToDisplay.project} size="lg" />}
        </div>
        {isSortingAllowed && <ReactTooltip />}
      </th>
    );
  }

  return (
    <div>
      <div>
        <ConsumablesViewModal
          modal={modal}
          setModal={setModal}
          recordType={recordType}
          record={selectedRow}
        />
        <Table responsive>
          <thead className="BuildingTableHeaderLine">
            <tr>
              {conditionalProjectTableHeaderUI()}
              <th onClick={() => handleSort('itemType')}>
                <div
                  data-tip={`Sort name ${sortOrder.itemType === 'asc' ? 'desc' : 'asc'}`}
                  className="d-flex align-items-stretch cusorpointer"
                >
                  <div>Name</div>
                  <FontAwesomeIcon icon={iconToDisplay.itemType} size="lg" />
                </div>
                <ReactTooltip />
              </th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Waste</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {consumablesViewData && consumablesViewData.length > 0 ? (
              consumablesViewData.map(rec => {
                return (
                  <tr key={rec._id}>
                    <td>{rec.project?.name}</td>
                    <td>{rec.itemType?.name}</td>
                    <td>{rec.itemType?.unit}</td>
                    <td>{rec.stockBought}</td>
                    <td>{rec.stockUsed}</td>
                    <td>{rec.stockAvailable}</td>
                    <td>{rec.stockWasted}</td>

                    <td className="materials_cell">
                      <button type="button" onClick={() => handleOpenModal(rec, 'UpdatesEdit')}>
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleOpenModal(rec, 'UpdatesView')}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleOpenModal(rec, 'PurchasesView')}
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
                  No consumables data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default ConsumablesTable;

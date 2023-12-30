import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import './Consumables.css'
import ConsumablesViewModal from './ConsumablesViewModal';
import ReactTooltip from 'react-tooltip';

function ConsumablesTable({ consumable, setConsumable, project, setProject }) {

  //Data fetched in the parent component : ConsumablesView
  const consumables = useSelector(state => state.bmConsumables.consumableslist);
  const [recordType, setRecordType] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState({ project: 'asc', itemType: 'asc' });
  const [iconToDisplay, setIconToDisplay] = useState({ project: faSortUp, itemType: faSortUp });
  const [consumablesViewData, setConsumablesViewData] = useState(consumables);

  const handleSort = (column) => {
    switch (column) {
      case 'project': {
        setSortOrder({ ...sortOrder, project: sortOrder.project === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({ ...iconToDisplay, project: iconToDisplay.project === faSortUp ? faSortDown : faSortUp });
        const factor = sortOrder.project === 'asc' ? 1 : -1;
        const _consumablesViewData = [...consumables].sort((a, b) => {
          return factor * (a?.project?.name.localeCompare(b?.project?.name));
        });
        setConsumablesViewData(_consumablesViewData);
        break;
      }
      case 'itemType': {
        setSortOrder({ ...sortOrder, itemType: sortOrder.itemType === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({ ...iconToDisplay, itemType: iconToDisplay.itemType === faSortUp ? faSortDown : faSortUp });
        const factor = sortOrder.itemType === 'asc' ? 1 : -1;
        const _consumablesViewData = [...consumables].sort((a, b) => {
          return factor * (a?.itemType?.name.localeCompare(b?.itemType?.name));
        });
        setConsumablesViewData(_consumablesViewData);
        break;
      }
    }
  };

  const handleOpenModal = (row, type) => {
    setSelectedRow(row); //current row data
    setRecordType(type); //UpdatesEdit/UpdatesView/PurchasesEdit/PurchasesView
    setModal(true);
  };

  useEffect(() => {
    if (project.value !== '0') {
      const _consumables = consumables.filter(rec => rec.project?.name === project.label);
      setConsumablesViewData(_consumables);
    } else {
      setConsumablesViewData([...consumables]);
    }
  }, [project]);

  useEffect(() => {
    let _consumables;
    if (project.value === '0' && consumable.value === '0') {
      setConsumablesViewData([...consumables]);
    } else if (project.value !== '0' && consumable.value === '0') {
      _consumables = consumables.filter(rec => rec.project?._id === project.value);
      setConsumablesViewData([..._consumables]);
    } else if (project.value === '0' && consumable.value !== '0') {
      _consumables = consumables.filter(rec => rec.itemType?.name === consumable.value);
      setConsumablesViewData([..._consumables]);
    } else {
      _consumables = consumables.filter(
        rec => rec.project?._id === project.value && rec.itemType?.name === consumable.value,
      );
      setConsumablesViewData([..._consumables]);
    }
  }, [project, consumable]);

  return (
    <div >
      <div >
        <ConsumablesViewModal modal={modal} setModal={setModal} recordType={recordType} record={selectedRow} />
        <Table responsive >
          <thead className='BuildingTableHeaderLine'>
            <tr>
              <th onClick={() => handleSort('project')}>
                <div data-tip={`Sort project ${sortOrder['project']}`} className='d-flex  align-self-stretch cusorpointer'>
                  <div>Project</div>
                  <FontAwesomeIcon icon={iconToDisplay['project']} size="lg" />
                </div>
                <ReactTooltip />
              </th>
              <th onClick={() => handleSort('itemType')}>
                <div data-tip={`Sort name ${sortOrder['itemType']}`} className='d-flex align-items-stretch cusorpointer'>
                  <div>Name</div>
                  <FontAwesomeIcon icon={iconToDisplay['itemType']} size="lg" />
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
  )
}

export default ConsumablesTable

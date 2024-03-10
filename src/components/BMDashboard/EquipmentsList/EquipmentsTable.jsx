import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import './Equipments.css';
import ReactTooltip from 'react-tooltip';
import { fetchAllEquipments } from 'actions/bmdashboard/equipmentActions';
import EquipmentsViewModal from './EquipmentsViewModal';

function EquipmentsTable({ equipment, project }) {
  // Data fetched in the parent component : EquipmentsView
  const dispatch = useDispatch();

  const equipments = useSelector(state => state.bmEquipments.equipmentslist);
  const [recordType, setRecordType] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState({ project: 'asc', itemType: 'asc' });
  const [iconToDisplay, setIconToDisplay] = useState({ project: faSortUp, itemType: faSortUp });
  const [equipmentsViewData, setEquipmentsViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEquipments());
  }, []);

  useEffect(() => {
    setEquipmentsViewData(equipments);
  }, [equipments]);

  const handleSort = column => {
    if (!column || equipments.length === 0) return;
    switch (column) {
      case 'project': {
        setSortOrder({ ...sortOrder, project: sortOrder.project === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({
          ...iconToDisplay,
          project: iconToDisplay.project === faSortUp ? faSortDown : faSortUp,
        });
        const factor = sortOrder.project === 'asc' ? 1 : -1;
        const _equipmentsViewData = [...equipments].sort((a, b) => {
          return factor * a.project.name.localeCompare(b.project.name);
        });
        setEquipmentsViewData(_equipmentsViewData);
        break;
      }
      case 'itemType': {
        setSortOrder({ ...sortOrder, itemType: sortOrder.itemType === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({
          ...iconToDisplay,
          itemType: iconToDisplay.itemType === faSortUp ? faSortDown : faSortUp,
        });
        const factor = sortOrder.itemType === 'asc' ? 1 : -1;
        const _equipmentsViewData = [...equipments].sort((a, b) => {
          return factor * a.itemType.name.localeCompare(b.itemType.name);
        });
        setEquipmentsViewData(_equipmentsViewData);
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleOpenModal = (row, type) => {
    setSelectedRow(row); // current row data
    setRecordType(type); // UpdatesEdit/UpdatesView/PurchasesEdit/PurchasesView
    setModal(true);
  };

  useEffect(() => {
    if (project.value !== '0') {
      const _equipments = equipments.filter(rec => rec.project?.name === project.label);
      setEquipmentsViewData(_equipments);
    } else {
      setEquipmentsViewData([...equipments]);
    }
  }, [project]);

  useEffect(() => {
    let _equipments;
    if (project.value === '0' && equipment.value === '0') {
      setEquipmentsViewData([...equipments]);
    } else if (project.value !== '0' && equipment.value === '0') {
      _equipments = equipments.filter(rec => rec.project?._id === project.value);
      setEquipmentsViewData([..._equipments]);
    } else if (project.value === '0' && equipment.value !== '0') {
      _equipments = equipments.filter(rec => rec.itemType?.name === equipment.value);
      setEquipmentsViewData([..._equipments]);
    } else {
      _equipments = equipments.filter(
        rec => rec.project?._id === project.value && rec.itemType?.name === equipment.value,
      );
      setEquipmentsViewData([..._equipments]);
    }
  }, [project, equipment]);

  return (
    <div>
      <div>
        <EquipmentsViewModal
          modal={modal}
          setModal={setModal}
          recordType={recordType}
          record={selectedRow}
        />
        <Table responsive>
          <thead className="BuildingTableHeaderLine">
            <tr>
              <th onClick={() => handleSort('project')}>
                <div
                  data-tip={`Sort project ${sortOrder.project}`}
                  className="d-flex  align-self-stretch cusorpointer"
                >
                  <div>Project</div>
                  <FontAwesomeIcon icon={iconToDisplay.project} size="lg" />
                </div>
                <ReactTooltip />
              </th>
              <th onClick={() => handleSort('itemType')}>
                <div
                  data-tip={`Sort name ${sortOrder.itemType}`}
                  className="d-flex align-items-stretch cusorpointer"
                >
                  <div>Name</div>
                  <FontAwesomeIcon icon={iconToDisplay.itemType} size="lg" />
                </div>
                <ReactTooltip />
              </th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Waste</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {equipmentsViewData && equipmentsViewData.length > 0 ? (
              equipmentsViewData.map(rec => {
                return (
                  <tr key={rec._id}>
                    <td>{rec.project?.name}</td>
                    <td>{rec.itemType?.name}</td>
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
                  No equipments data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default EquipmentsTable;

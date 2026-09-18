import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from 'react-tooltip';
import { Link } from 'react-router-dom';
import { fetchAllEquipments } from '~/actions/bmdashboard/equipmentActions';
import EquipmentListModal from './EquipmentListModal';
import styles from './Equipments.module.css';

function EquipmentsTable({ equipment, project }) {
  const dispatch = useDispatch();

  const equipments = useSelector(state => state.bmEquipments.equipmentslist);
  const [recordType, setRecordType] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState({
    project: 'asc',
    itemType: 'asc',
    rentedOn: 'asc',
    rentedDue: 'asc',
  });
  const [iconToDisplay, setIconToDisplay] = useState({
    project: faSortUp,
    itemType: faSortUp,
    rentedOn: faSortUp,
    rentedDue: faSortUp,
  });
  const [equipmentsViewData, setEquipmentsViewData] = useState(null);

  const hasProjectFilter = Array.isArray(project) && project.length > 0;
  const hasEquipmentFilter = Array.isArray(equipment) && equipment.length > 0;

  const applyFilters = data => {
    let result = [...data];
    if (hasProjectFilter) {
      result = result.filter(rec => project.includes(rec.project?._id));
    }
    if (hasEquipmentFilter) {
      result = result.filter(rec => equipment.includes(rec.itemType?.name));
    }
    return result;
  };

  useEffect(() => {
    dispatch(fetchAllEquipments());
  }, []);

  useEffect(() => {
    setEquipmentsViewData(equipments);
  }, [equipments]);

  useEffect(() => {
    setEquipmentsViewData(applyFilters(equipments));
  }, [project, equipment, equipments]);

  const handleSort = column => {
    if (!column || equipments.length === 0) return;

    const filtered = applyFilters(equipments);

    const factor = sortOrder[column] === 'asc' ? 1 : -1;
    let sorted;

    switch (column) {
      case 'project': {
        sorted = [...filtered].sort(
          (a, b) => factor * (a.project?.name || '').localeCompare(b.project?.name || ''),
        );
        break;
      }
      case 'itemType': {
        sorted = [...filtered].sort(
          (a, b) => factor * (a.itemType?.name || '').localeCompare(b.itemType?.name || ''),
        );
        break;
      }
      case 'rentedOn': {
        sorted = [...filtered].sort(
          (a, b) => factor * (new Date(b.rentedOnDate) - new Date(a.rentedOnDate)),
        );
        break;
      }
      case 'rentedDue': {
        sorted = [...filtered].sort(
          (a, b) => factor * (new Date(b.rentalDueDate) - new Date(a.rentalDueDate)),
        );
        break;
      }
      default:
        return;
    }

    setSortOrder(prev => ({ ...prev, [column]: prev[column] === 'asc' ? 'desc' : 'asc' }));
    setIconToDisplay(prev => ({
      ...prev,
      [column]: prev[column] === faSortUp ? faSortDown : faSortUp,
    }));
    setEquipmentsViewData(sorted);
  };

  const handleOpenModal = (row, type) => {
    setSelectedRow(row);
    setRecordType(type);
    setModal(true);
  };

  return (
    <div>
      <EquipmentListModal
        modal={modal}
        setModal={setModal}
        recordType={recordType}
        record={selectedRow}
      />
      <div className={styles.tableWrapper}>
        <Table responsive hover>
          <thead className={styles.BuildingTableHeaderLine}>
            <tr>
              <th onClick={() => handleSort('project')}>
                <div data-tip={`Sort project ${sortOrder.project}`} className={styles.cusorpointer}>
                  <div>Project</div>
                  <FontAwesomeIcon icon={iconToDisplay.project} size="sm" />
                </div>
                <ReactTooltip />
              </th>
              <th onClick={() => handleSort('itemType')}>
                <div data-tip={`Sort name ${sortOrder.itemType}`} className={styles.cusorpointer}>
                  <div>Name</div>
                  <FontAwesomeIcon icon={iconToDisplay.itemType} size="sm" />
                </div>
                <ReactTooltip />
              </th>
              <th>Bought</th>
              <th>Rental</th>
              <th onClick={() => handleSort('rentedOn')}>
                <div
                  data-tip={`Sort Rented On ${sortOrder.rentedOn}`}
                  className={styles.cusorpointer}
                >
                  <div>Rented On</div>
                  <FontAwesomeIcon icon={iconToDisplay.rentedOn} size="sm" />
                </div>
                <ReactTooltip />
              </th>
              <th onClick={() => handleSort('rentedDue')}>
                <div
                  data-tip={`Sort Rental Due ${sortOrder.rentedDue}`}
                  className={styles.cusorpointer}
                >
                  <div>Rental Due</div>
                  <FontAwesomeIcon icon={iconToDisplay.rentedDue} size="sm" />
                </div>
                <ReactTooltip />
              </th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {equipmentsViewData && equipmentsViewData.length > 0 ? (
              equipmentsViewData.map(rec => (
                <tr key={rec._id}>
                  <td>{rec.project?.name}</td>
                  <td>
                    <Link
                      to={`/bmdashboard/equipment/${rec._id}`}
                      className={styles.linkButton}
                      data-tip="Open equipment details"
                    >
                      {rec.itemType?.name || rec.name || 'View Details'}
                    </Link>
                  </td>
                  <td>{rec.purchaseStatus === 'Purchased' ? 'Yes' : 'No'}</td>
                  <td>{rec.purchaseStatus === 'Rental' ? 'Yes' : 'No'}</td>
                  <td>{new Date(rec.rentedOnDate).toLocaleDateString()}</td>
                  <td>{new Date(rec.rentalDueDate).toLocaleDateString()}</td>
                  <td className="materials_cell">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(rec, 'UpdatesEdit')}
                      aria-label="Edit updates"
                    >
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
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
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

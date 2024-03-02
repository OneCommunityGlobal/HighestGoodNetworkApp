import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import './ReusablesViewStyle.css';
import ReactTooltip from 'react-tooltip';
import { fetchAllReusables } from 'actions/bmdashboard/reusableActions';
import { BiPencil } from 'react-icons/bi';
import UpdateReusbableModal from '../UpdateReusables/UpdateReusableModal';

function ReusablesTable({ reusable, project }) {
  const dispatch = useDispatch();
  const reusables = useSelector(state => state.bmReusables.reusablesList);
  const [sortOrder, setSortOrder] = useState({ project: 'asc', itemType: 'asc' });
  const [iconToDisplay, setIconToDisplay] = useState({ project: faSortUp, itemType: faSortUp });
  const [reusablesViewData, setReusablesViewData] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState(null);

  useEffect(() => {
    dispatch(fetchAllReusables());
  }, [dispatch]);

  useEffect(() => {
    setReusablesViewData(reusables);
  }, [reusables]);

  const handleSort = column => {
    if (!column || reusables.length === 0) {
      return;
    }

    if (project.value !== '0' && column === 'project') {
      return;
    }

    const filteredReusables =
      project.value !== '0'
        ? reusables.filter(rec => rec.project?._id === project.value)
        : reusables;

    const newSortOrder = sortOrder[column] === 'asc' ? 'desc' : 'asc';
    setSortOrder(prevOrder => ({ ...prevOrder, [column]: newSortOrder }));

    const newIcon = iconToDisplay[column] === faSortUp ? faSortDown : faSortUp;
    setIconToDisplay(prevIcons => ({ ...prevIcons, [column]: newIcon }));

    const factor = newSortOrder === 'asc' ? 1 : -1;
    const sortedReusables = filteredReusables.sort((a, b) => {
      const nameA = a[column]?.name || '';
      const nameB = b[column]?.name || '';
      return factor * nameA.localeCompare(nameB);
    });

    setReusablesViewData(sortedReusables);
  };

  useEffect(() => {
    let filteredReusables = reusables;
    if (project.value !== '0') {
      filteredReusables = filteredReusables.filter(rec => rec.project?._id === project.value);
    }
    if (reusable.value !== '0') {
      filteredReusables = filteredReusables.filter(rec => rec.itemType?.name === reusable.value);
    }
    setReusablesViewData([...filteredReusables]);
  }, [project, reusable, reusables]);

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

  const handleEditResuableClick = record => {
    console.log(record);
    setRecordToUpdate(record);
    setModalIsOpen(true);
  };

  return (
    <>
      <UpdateReusbableModal modal={modalIsOpen} setModal={setModalIsOpen} record={recordToUpdate} />
      <div>
        <Table responsive>
          <thead className="BuildingTableHeaderLine">
            <tr>
              {conditionalProjectTableHeaderUI()}
              <th onClick={() => handleSort('itemType')}>
                <div
                  data-tip={`Sort name ${sortOrder.itemType === 'asc' ? 'desc' : 'asc'}`}
                  className="d-flex align-items-stretch cursor-pointer"
                >
                  <div>Name</div>
                  <FontAwesomeIcon icon={iconToDisplay.itemType} size="lg" />
                </div>
                <ReactTooltip />
              </th>

              <th>Bought</th>
              <th>Available</th>
              <th>Destroyed</th>
              <th>Updates</th>
            </tr>
          </thead>
          <tbody>
            {reusablesViewData && reusablesViewData.length > 0 ? (
              reusablesViewData.map(rec => (
                <tr key={rec._id}>
                  <td>{rec.project?.name}</td>
                  <td>{rec.itemType?.name}</td>
                  <td>{rec.stockBought}</td>
                  <td>{rec.stockAvailable}</td>
                  <td>{rec.stockDestroyed}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleEditResuableClick(rec)}
                      style={{ cursor: 'pointer' }}
                    >
                      <BiPencil />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No reusables data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default ReusablesTable;

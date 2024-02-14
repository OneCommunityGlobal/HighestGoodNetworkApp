import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import './ReusablesViewStyle.css';
import ReactTooltip from 'react-tooltip';
import { fetchAllReusables } from 'actions/bmdashboard/reusableActions';

function ReusablesTable({ reusable, project }) {
  const dispatch = useDispatch();

  const reusables = useSelector(state => state.bmReusables.reusablesList);
  const [recordType, setRecordType] = useState(null);
  const [modal, setModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [sortOrder, setSortOrder] = useState({ project: 'asc', itemType: 'asc' });
  const [iconToDisplay, setIconToDisplay] = useState({ project: faSortUp, itemType: faSortUp });
  const [reusablesViewData, setReusablesViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchAllReusables());
  }, []);

  useEffect(() => {
    setReusablesViewData(reusables);
  }, [reusables]);

  const handleSort = column => {
    if (!column || reusables.length === 0) return;
    switch (column) {
      case 'project': {
        setSortOrder({ ...sortOrder, project: sortOrder.project === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({
          ...iconToDisplay,
          project: iconToDisplay.project === faSortUp ? faSortDown : faSortUp,
        });
        const factor = sortOrder.project === 'asc' ? 1 : -1;
        const sortedReusables = [...reusables].sort((a, b) => {
          return factor * a.project.name.localeCompare(b.project.name);
        });
        setReusablesViewData(sortedReusables);
        break;
      }
      case 'itemType': {
        setSortOrder({ ...sortOrder, itemType: sortOrder.itemType === 'asc' ? 'desc' : 'asc' });
        setIconToDisplay({
          ...iconToDisplay,
          itemType: iconToDisplay.itemType === faSortUp ? faSortDown : faSortUp,
        });
        const factor = sortOrder.itemType === 'asc' ? 1 : -1;
        const sortedReusables = [...reusables].sort((a, b) => {
          return factor * a.itemType.name.localeCompare(b.itemType.name);
        });
        setReusablesViewData(sortedReusables);
        break;
      }
      default: {
        break;
      }
    }
  };


  useEffect(() => {
    if (project.value !== '0') {
      const filteredReusables = reusables.filter(rec => rec.project?.name === project.label);
      setReusablesViewData(filteredReusables);
    } else {
      setReusablesViewData([...reusables]);
    }
  }, [project]);

  useEffect(() => {
    let filteredReusables;
    if (project.value === '0' && reusable.value === '0') {
      setReusablesViewData([...reusables]);
    } else if (project.value !== '0' && reusable.value === '0') {
      filteredReusables = reusables.filter(rec => rec.project?._id === project.value);
      setReusablesViewData([...filteredReusables]);
    } else if (project.value === '0' && reusable.value !== '0') {
      filteredReusables = reusables.filter(rec => rec.itemType?.name === reusable.value);
      setReusablesViewData([...filteredReusables]);
    } else {
      filteredReusables = reusables.filter(
        rec => rec.project?._id === project.value && rec.itemType?.name === reusable.value,
      );
      setReusablesViewData([...filteredReusables]);
    }
  }, [project, reusable]);

  return (
    <div>
      <Table responsive>
        <thead className="BuildingTableHeaderLine">
          <tr>
            <th onClick={() => handleSort('project')}>
              <div data-tip={`Sort project ${sortOrder.project}`} className="d-flex align-items-stretch cursor-pointer">
                <div>Project</div>
                <FontAwesomeIcon icon={iconToDisplay.project} size="lg" />
              </div>
              <ReactTooltip />
            </th>
            <th onClick={() => handleSort('itemType')}>
              <div data-tip={`Sort name ${sortOrder.itemType}`} className="d-flex align-items-stretch cursor-pointer">
                <div>Name</div>
                <FontAwesomeIcon icon={iconToDisplay.itemType} size="lg" />
              </div>
              <ReactTooltip />
            </th>
            <th>Bought</th>
            <th>Available</th>
            <th>Destroyed</th>
            {/* <th>Updates</th>
            <th>Purchases</th> */}
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
                <td className="materials_cell">

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
  );
}

export default ReusablesTable;

import { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button, Table, UncontrolledTooltip } from 'reactstrap';
import Select from 'react-select';

import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import {
  fetchAllEquipments,
  updateMultipleEquipmentLogs,
} from '~/actions/bmdashboard/equipmentActions';
import { getHeaderData } from '~/actions/authActions';
import { getUserProfile } from '~/actions/userProfile';

import styles from './EDailyActivityLog.module.css';

const TODAY = new Date().toISOString().split('T')[0];

const buildToolNumbers = (name = 'EQ', qty = 0) => {
  const prefix = (
    name
      .match(/\b(\w)/g)
      ?.join('')
      .toUpperCase() || 'EQ'
  ).slice(0, 4);
  return Array.from({ length: qty }, (_, i) => `${prefix}${i + 1}`);
};

const buildRows = list =>
  list.map(e => {
    const total = (e.purchaseRecord || []).reduce((sum, rec) => sum + (rec.quantity || 0), 0) || 0;

    const checkInQty = (e.logRecord || [])
      .filter(l => l.type === 'Check In')
      .reduce((s, l) => s + (l.quantity || 1), 0);

    const checkOutQty = (e.logRecord || [])
      .filter(l => l.type === 'Check Out')
      .reduce((s, l) => s + (l.quantity || 1), 0);

    const usingQty = Math.max(checkInQty - checkOutQty, 0);
    const availableQty = Math.max(total - usingQty, 0);

    const allNumbers = buildToolNumbers(e.itemType?.name, total);
    const inUseNumbers = allNumbers.slice(0, usingQty);
    const availableNumbers = allNumbers.slice(usingQty);

    return {
      id: e._id,
      name: e.itemType?.name || 'Unknown',
      workingQty: total,
      usingQty,
      availableQty,
      inUseNumbers,
      availableNumbers,
      selectedNumbers: [],
    };
  });

const getSelectStyles = (darkMode, isTableSelect = false) => ({
  container: base => ({
    ...base,
    width: isTableSelect ? 300 : '100%',
    minWidth: isTableSelect ? 300 : 'auto',
    maxWidth: isTableSelect ? 300 : 'none',
  }),
  control: base => ({
    ...base,

    backgroundColor: darkMode ? '#2a3f5f' : '#fff',
    borderColor: darkMode ? '#3a506b' : '#ced4da',
    color: darkMode ? '#e0e0e0' : '#000',
  }),
  singleValue: base => ({
    ...base,
    color: darkMode ? '#e0e0e0' : '#000',
  }),
  input: base => ({
    ...base,
    color: darkMode ? '#e0e0e0' : '#000',
  }),
  menu: base => ({
    ...base,
    backgroundColor: darkMode ? '#2a3f5f' : '#fff',
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,

    backgroundColor: state.isFocused
      ? darkMode
        ? '#3a506b'
        : '#e9ecef'
      : darkMode
      ? '#2a3f5f'
      : '#fff',
    color: darkMode ? '#e0e0e0' : '#000',
    cursor: 'pointer',
  }),
  placeholder: base => ({
    ...base,
    color: darkMode ? '#e0e0e0' : '#6c757d',
    opacity: 0.7,
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: darkMode ? '#3a506b' : '#e9ecef',
  }),
  multiValueLabel: base => ({
    ...base,
    color: darkMode ? '#e0e0e0' : '#000',
  }),
  multiValueRemove: base => ({
    ...base,
    color: darkMode ? '#e0e0e0' : '#000',
    ':hover': {
      backgroundColor: 'red',
      color: 'white',
    },
  }),
});

function EDailyActivityLog(props) {
  const dispatch = useDispatch();

  const bmProjects = useSelector(s => s.bmProjects || []);
  const equipments = useSelector(s => s.bmEquipments?.equipmentslist || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const { user } = props.auth;

  const [selectedProject, setSelectedProject] = useState(null);
  const [date, setDate] = useState(TODAY);
  const [logType, setLogType] = useState('check-in');
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject?.value) {
      dispatch(fetchAllEquipments(selectedProject.value));
    }
  }, [selectedProject, dispatch]);

  const derived = useMemo(() => buildRows(equipments), [equipments]);
  useEffect(() => setRows(derived), [derived]);

  const onToolSelect = (rowIdx, selected) => {
    setRows(prev => {
      const row = prev[rowIdx];
      const valid = logType === 'check-in' ? row.availableNumbers : row.inUseNumbers;
      const limit = logType === 'check-in' ? row.availableQty : row.usingQty;

      const clean = selected
        .map(o => o.value)
        .filter(v => valid.includes(v))
        .slice(0, limit);

      return prev.map((r, i) => (i === rowIdx ? { ...r, selectedNumbers: clean } : r));
    });
  };

  const flipLogType = newType => {
    setLogType(newType);
    setRows(prev =>
      prev.map(r => {
        const valid = newType === 'check-in' ? r.availableNumbers : r.inUseNumbers;
        const limit = newType === 'check-in' ? r.availableQty : r.usingQty;
        return {
          ...r,
          selectedNumbers: r.selectedNumbers.filter(n => valid.includes(n)).slice(0, limit),
        };
      }),
    );
  };

  const handleCancel = () => {
    setSelectedProject(null);
    setRows([]);
    setLogType('check-in');
    setDate(TODAY);
  };

  const handleSubmit = () => {
    const payload = rows.flatMap(r =>
      r.selectedNumbers.map(() => ({
        equipmentId: r.id,
        logEntry: {
          createdBy: user.userid,
          responsibleUser: null,
          type: logType === 'check-in' ? 'Check In' : 'Check Out',
          date,
        },
      })),
    );

    dispatch(updateMultipleEquipmentLogs(selectedProject.value, payload));
  };

  const projectSelectStyles = getSelectStyles(darkMode, false);
  const tableSelectStyles = getSelectStyles(darkMode, true);

  return (
    <div className={`container-fluid ${styles.mainContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className="container">
        <h4 className="mb-4 pt-3">Daily Equipment Log</h4>

        {/* Header Row */}
        <div className="row mb-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label fw-bold" htmlFor="date">
              Date
            </label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label fw-bold" htmlFor="project-select">
              Project
            </label>
            <Select
              inputId="project-select"
              value={selectedProject}
              onChange={setSelectedProject}
              options={bmProjects.map(p => ({ label: p.name, value: p._id }))}
              placeholder="Select project…"
              isClearable
              styles={projectSelectStyles}
            />
          </div>

          <div className="col-md-3">
            <div className="form-label font-weight-bold mb-2" id="log-type-label">
              Log Type
            </div>

            <div className="d-flex" role="group" aria-labelledby="log-type-label">
              <Button
                color={logType === 'check-in' ? 'primary' : 'secondary'}
                onClick={() => flipLogType('check-in')}
                className={styles.checkInBtn}
              >
                Check In
              </Button>
              <Button
                color={logType === 'check-out' ? 'primary' : 'secondary'}
                onClick={() => flipLogType('check-out')}
                className={styles.checkOutBtn}
              >
                Check Out
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table bordered responsive>
          <thead className={`${darkMode ? styles.tableDark : 'table-light'} align-middle`}>
            <tr>
              <th>Name</th>
              <th>
                Working
                <i className={`fa fa-info-circle ${styles.infoIcon}`} id="tooltip-working"></i>
                <UncontrolledTooltip placement="top" target="tooltip-working">
                  Total number of units operational today
                </UncontrolledTooltip>
              </th>
              <th>
                Available
                <i className={`fa fa-info-circle ${styles.infoIcon}`} id="tooltip-available"></i>
                <UncontrolledTooltip placement="top" target="tooltip-available">
                  Number of units currently not in use
                </UncontrolledTooltip>
              </th>
              <th>
                Using
                <i className={`fa fa-info-circle ${styles.infoIcon}`} id="tooltip-using"></i>
                <UncontrolledTooltip placement="top" target="tooltip-using">
                  Quantity being checked in/out
                </UncontrolledTooltip>
              </th>
              <th>
                Tool / Equipment #
                <i className={`fa fa-info-circle ${styles.infoIcon}`} id="tooltip-toolnum"></i>
                <UncontrolledTooltip placement="top" target="tooltip-toolnum">
                  Select the specific tool identifier
                </UncontrolledTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {!selectedProject && (
              <tr>
                <td colSpan={5} className={`text-center py-3 ${darkMode ? styles.darkMode : ''}`}>
                  Select a project to load equipments.
                </td>
              </tr>
            )}

            {selectedProject && rows.length === 0 && (
              <tr className={`${darkMode ? styles.darkMode : ''}`}>
                <td colSpan={5} className="text-center py-3">
                  No equipments found for this project.
                </td>
              </tr>
            )}

            {selectedProject &&
              rows.length > 0 &&
              rows.map((r, idx) => {
                const validList = logType === 'check-in' ? r.availableNumbers : r.inUseNumbers;
                const limit = logType === 'check-in' ? r.availableQty : r.usingQty;

                return (
                  <tr key={r.id} className={`${darkMode ? styles.darkMode : ''}`}>
                    <td>{r.name}</td>
                    <td>{r.workingQty}</td>
                    <td>{r.availableQty}</td>
                    <td>{r.usingQty}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Select
                        isMulti
                        closeMenuOnSelect={false}
                        value={r.selectedNumbers.map(v => ({ label: v, value: v }))}
                        options={validList.map(n => ({ label: n, value: n }))}
                        onChange={sel => onToolSelect(idx, sel)}
                        placeholder={`Pick up to ${limit}…`}
                        menuPortalTarget={document.body}
                        styles={tableSelectStyles}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>

        <div className={styles.actionContainer}>
          <Button color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  getHeaderData,
  getUserProfile,
})(EDailyActivityLog);

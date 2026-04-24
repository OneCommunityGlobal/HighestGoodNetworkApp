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
import { toast } from 'react-toastify';

import styles from './EDailyActivityLog.module.css';

// Helper function to get today's date in YYYY-MM-DD format
const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

    const usingQty = Math.max(checkOutQty - checkInQty, 0);
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
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
  }),
  singleValue: base => ({
    ...base,
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
  }),
  input: base => ({
    ...base,
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
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
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
    cursor: 'pointer',
  }),
  placeholder: base => ({
    ...base,
    color: darkMode ? '#ffffff' : '#6c757d', // Changed to pure white
    opacity: 0.7, // Kept the opacity so it still looks like a placeholder
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: darkMode ? '#3a506b' : '#e9ecef',
  }),
  multiValueLabel: base => ({
    ...base,
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
  }),
  multiValueRemove: base => ({
    ...base,
    color: darkMode ? '#ffffff' : '#000', // Changed to pure white
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
  const [date, setDate] = useState(getToday());
  const [logType, setLogType] = useState('check-in'); // 'check-in' | 'check-out'

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Deriving validation states
  const isMissingProject = !selectedProject;
  const isInvalidDate = !date || isNaN(Date.parse(date));
  const hasNoEquipments = isMissingProject || rows.length === 0;
  const noEquipmentSelected = rows.length === 0 || rows.every(r => r.selectedNumbers.length === 0);
  const isSubmitDisabled = isMissingProject || isInvalidDate || noEquipmentSelected;

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject?.value) {
      setIsLoading(true);
      dispatch(fetchAllEquipments(selectedProject.value)).finally(() => setIsLoading(false));
    }
  }, [selectedProject, dispatch]);

  const derived = useMemo(() => buildRows(equipments), [equipments]);
  useEffect(() => setRows(derived), [derived]);

  const onToolSelect = (rowIdx, selected) => {
    setRows(prev => {
      const row = prev[rowIdx];
      const valid = logType === 'check-in' ? row.inUseNumbers : row.availableNumbers;
      const limit = logType === 'check-in' ? row.usingQty : row.availableQty;

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
        const valid = newType === 'check-in' ? r.inUseNumbers : r.availableNumbers;
        const limit = newType === 'check-in' ? r.usingQty : r.availableQty;
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
    setDate(getToday());
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    setShowConfirm(true);
  };
  const confirmSubmit = () => {
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
    setShowConfirm(false);
    toast.success(
      logType === 'check-in'
        ? 'Equipment checked in successfully'
        : 'Equipment checked out successfully',
    );

    // Clear selections immediately so UI responds while backend async request finishes
    setRows(prev => prev.map(r => ({ ...r, selectedNumbers: [] })));
  };

  const projectSelectStyles = getSelectStyles(darkMode, false);
  const tableSelectStyles = getSelectStyles(darkMode, true);

  return (
    <div className={`container-fluid ${styles.mainContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Custom dark mode styling for native date pickers and specific table hovers */}
      {darkMode && (
        <style>{`
          .dark-table-row:hover,
          thead.table-dark tr.text-light:hover,
          tr.select-project-row.dark-mode:hover {
            background-color: #222 !important;
            color: #fff !important;
            transition: background-color 0.2s;
          }
          
          .dark-date-input {
            background-color: #343a40 !important;
            color: #f8f9fa !important;
            border-color: #495057 !important;
          }
          
          .dark-date-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            background-color: #495057;
            border-radius: 4px;
            padding: 4px;
          }
          
          .dark-date-input::-webkit-datetime-edit,
          .dark-date-input::-webkit-datetime-edit-fields-wrapper,
          .dark-date-input::-webkit-datetime-edit-text,
          .dark-date-input::-webkit-datetime-edit-month-field,
          .dark-date-input::-webkit-datetime-edit-day-field,
          .dark-date-input::-webkit-datetime-edit-year-field {
            color: #f8f9fa;
          }
          
          .dark-date-input[type="date"] {
            color-scheme: dark;
          }
          
          @supports (-webkit-appearance: none) or (-moz-appearance: none) {
            .dark-date-input {
              color-scheme: dark;
            }
          }
        `}</style>
      )}

      {!darkMode && (
        <style>{`
          .light-date-input {
            background-color: #fff !important;
            color: #000 !important;
            border-color: #ced4da !important;
          }
          
          .light-date-input::-webkit-calendar-picker-indicator {
            filter: invert(0);
          }
          
          .light-date-input[type="date"] {
            color-scheme: light;
          }
        `}</style>
      )}

      <div className={styles.container}>
        <h4 className="mb-4 pt-3">Daily Equipment Log</h4>
        {showConfirm && (
          <div
            className="alert alert-warning d-flex justify-content-between align-items-center"
            style={
              darkMode
                ? {
                    backgroundColor: 'rgba(255, 193, 7, 0.18)',
                    borderColor: 'rgba(255, 193, 7, 0.35)',
                    color: '#f8f9fa',
                  }
                : undefined
            }
          >
            <span>Are you sure? This will update equipment availability.</span>
            <div className={styles['d-flex']}>
              <Button
                size="sm"
                color="secondary"
                className={styles['mr-2']}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" color="danger" onClick={confirmSubmit}>
                Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Header Row */}
        <div className="row mb-3 align-items-start">
          <div className={styles['col-md-3']}>
            <label
              className={`form-label fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}
              htmlFor="date"
              style={darkMode ? { color: '#f8f9fa' } : {}}
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              className={`form-control ${darkMode ? 'dark-date-input' : 'light-date-input'}`}
              value={date}
              min={getToday()}
              onChange={e => setDate(e.target.value)}
              style={
                darkMode
                  ? {
                      backgroundColor: '#343a40',
                      color: '#f8f9fa',
                      borderColor: '#495057',
                    }
                  : {}
              }
            />
            {isInvalidDate && (
              <small className="text-danger mt-1 d-block">Please select a valid date.</small>
            )}
            {darkMode && (
              <small className="text-muted mt-1 d-block">
                Note: Calendar appearance depends on your browser and OS.
              </small>
            )}
          </div>

          <div className={styles['col-md-5']}>
            <label
              className={`form-label fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}
              htmlFor="project-select"
              style={darkMode ? { color: '#f8f9fa' } : {}}
            >
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
            {isMissingProject && (
              <small className="text-danger mt-1 d-block">Project selection is required.</small>
            )}
          </div>

          <div className={styles['col-md-4']}>
            <div
              className={`form-label fw-bold ${darkMode ? 'text-light' : 'text-dark'}`}
              id="log-type-label"
              style={darkMode ? { color: '#f8f9fa' } : {}}
            >
              Log Type
            </div>

            <div className={styles['d-flex']} role="group" aria-labelledby="log-type-label">
              <Button
                color={logType === 'check-in' ? 'primary' : 'secondary'}
                onClick={() => !hasNoEquipments && flipLogType('check-in')}
                className={styles.checkInBtn}
                disabled={hasNoEquipments}
                style={hasNoEquipments ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
              >
                Check In
              </Button>
              <Button
                color={logType === 'check-out' ? 'primary' : 'secondary'}
                onClick={() => !hasNoEquipments && flipLogType('check-out')}
                className={styles.checkOutBtn}
                disabled={hasNoEquipments}
                style={hasNoEquipments ? { opacity: 0.65, cursor: 'not-allowed' } : {}}
              >
                Check Out
              </Button>
            </div>
            <small
              className={`mt-2 d-block ${styles.helperText} ${
                darkMode ? 'text-light' : 'text-muted'
              }`}
            >
              <strong>Check In:</strong> Report equipment as returned and available.
              <br />
              <strong>Check Out:</strong> Assign equipment for current use.
            </small>
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
              <tr className={darkMode ? `select-project-row dark-mode ${styles.darkMode}` : ''}>
                <td colSpan={5} className={`text-center py-3 ${darkMode ? 'text-light' : ''}`}>
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
                const validList = logType === 'check-in' ? r.inUseNumbers : r.availableNumbers;
                const limit = logType === 'check-in' ? r.usingQty : r.availableQty;

                return (
                  <tr
                    key={r.id}
                    className={darkMode ? `dark-table-row text-light ${styles.darkMode}` : ''}
                  >
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
          <Button
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            style={isSubmitDisabled ? { cursor: 'not-allowed', opacity: 0.65 } : {}}
          >
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

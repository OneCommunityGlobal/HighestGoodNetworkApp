import { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { Button, ButtonGroup, Table } from 'reactstrap';

import { getHeaderData } from '~/actions/authActions';
import {
  fetchAllEquipments,
  updateMultipleEquipmentLogs,
} from '~/actions/bmdashboard/equipmentActions';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { getUserProfile } from '~/actions/userProfile';
import {
  getBaseSelectStyles,
  getToolPickerSelectStyles,
} from '~/components/BMDashboard/shared/selectStyles';

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

function EDailyActivityLog(props) {
  const dispatch = useDispatch();

  /* redux slices */
  const bmProjects = useSelector(s => s.bmProjects || []);
  const equipments = useSelector(s => s.bmEquipments?.equipmentslist || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const { user } = props.auth;

  /* local state */
  const [selectedProject, setSelectedProject] = useState(null);
  const [date, setDate] = useState(getToday());
  const [logType, setLogType] = useState('check-in'); // 'check-in' | 'check-out'
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  /* fetch equipments whenever project changes */
  useEffect(() => {
    if (selectedProject?.value) {
      dispatch(fetchAllEquipments(selectedProject.value));
    }
  }, [selectedProject, dispatch]);

  /* build rows whenever equipments slice updates */
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
    setDate(getToday());
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

  // Memoise style objects so they are not recreated on every render
  const projectSelectStyles = useMemo(() => getBaseSelectStyles(darkMode), [darkMode]);
  const toolPickerStyles = useMemo(() => getToolPickerSelectStyles(darkMode), [darkMode]);

  return (
    <div
      className={`container-fluid ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{ height: '100%' }}
    >
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
          .dark-date-input[type="date"] { color-scheme: dark; }
          @supports (-webkit-appearance: none) or (-moz-appearance: none) {
            .dark-date-input { color-scheme: dark; }
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
          .light-date-input[type="date"] { color-scheme: light; }
        `}</style>
      )}

      <div className="container">
        <h4 className="mb-4">Daily Equipment Log</h4>

        {/* header */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className={`form-label fw-bold${darkMode ? ' text-light' : ''}`} htmlFor="date">
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
                  ? { backgroundColor: '#343a40', color: '#f8f9fa', borderColor: '#495057' }
                  : {}
              }
            />
            {darkMode && (
              <small className="text-muted mt-1 d-block">
                Note: Calendar appearance depends on your browser and OS.
              </small>
            )}
          </div>

          <div className="col-md-5">
            <label
              className={`form-label fw-bold${darkMode ? ' text-light' : ''}`}
              htmlFor="project-select"
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
          </div>

          <div className="col-md-4">
            <p className={`form-label fw-bold${darkMode ? ' text-light' : ''}`} id="log-type-label">
              Log Type
            </p>
            <ButtonGroup className="d-block" aria-labelledby="log-type-label">
              <Button
                color={logType === 'check-in' ? 'primary' : 'secondary'}
                onClick={() => flipLogType('check-in')}
              >
                Check In
              </Button>
              <Button
                color={logType === 'check-out' ? 'primary' : 'secondary'}
                onClick={() => flipLogType('check-out')}
              >
                Check Out
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* table */}
        <Table bordered responsive>
          <thead className={`${darkMode ? 'table-dark' : 'table-light'} align-middle`}>
            <tr className={darkMode ? 'text-light' : 'text-dark'}>
              <th>Name</th>
              <th>Working</th>
              <th>Available</th>
              <th>Using</th>
              <th>Tool / Equipment&nbsp;#</th>
            </tr>
          </thead>
          <tbody>
            {!selectedProject && (
              <tr className={darkMode ? 'select-project-row dark-mode' : ''}>
                <td
                  colSpan={5}
                  className={`text-center py-3 ${darkMode ? 'text-light' : 'text-dark'}`}
                >
                  Select a project to load equipments.
                </td>
              </tr>
            )}

            {selectedProject && rows.length === 0 && (
              <tr className={darkMode ? 'text-light' : 'text-dark'}>
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
                  <tr key={r.id} className={darkMode ? 'dark-table-row text-light' : 'text-dark'}>
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
                        styles={toolPickerStyles}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>

        {/* actions */}
        <div className="d-flex justify-content-end gap-2">
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

import { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button, ButtonGroup, Table } from 'reactstrap';
import Select from 'react-select';

import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import {
  fetchAllEquipments,
  updateMultipleEquipmentLogs,
} from '~/actions/bmdashboard/equipmentActions';
import { getHeaderData } from '~/actions/authActions';
import { getUserProfile } from '~/actions/userProfile';

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

  return (
    <div
      className={`container-fluid ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{ height: '100%' }}
    >
      {/* Custom dark mode table row and header hover style: dark background, light text */}
      {darkMode && (
        <style>{`
          .dark-table-row:hover,
          thead.table-dark tr.text-light:hover,
          tr.select-project-row.dark-mode:hover {
            background-color: #222 !important;
            color: #fff !important;
            transition: background-color 0.2s;
          }
          
          /* Comprehensive dark mode date picker styling */
          .dark-date-input {
            background-color: #343a40 !important;
            color: #f8f9fa !important;
            border-color: #495057 !important;
          }
          
          .dark-date-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
          
          .dark-date-input::-webkit-datetime-edit {
            color: #f8f9fa;
          }
          
          .dark-date-input::-webkit-datetime-edit-fields-wrapper {
            color: #f8f9fa;
          }
          
          .dark-date-input::-webkit-datetime-edit-text {
            color: #f8f9fa;
          }
          
          .dark-date-input::-webkit-datetime-edit-month-field,
          .dark-date-input::-webkit-datetime-edit-day-field,
          .dark-date-input::-webkit-datetime-edit-year-field {
            color: #f8f9fa;
          }
          
          /* For Firefox */
          .dark-date-input[type="date"] {
            color-scheme: dark;
          }
          
          /* For calendar dropdown - limited browser support */
          .dark-date-input::-webkit-calendar-picker-indicator {
            background-color: #495057;
            border-radius: 4px;
            padding: 4px;
          }
          
          /* Make the calendar dropdown dark - this is limited to browsers that support it */
          @supports (-webkit-appearance: none) or (-moz-appearance: none) {
            .dark-date-input {
              color-scheme: dark;
            }
          }
        `}</style>
      )}

      {/* Also add light mode styles */}
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

      <div className="container">
        <h4 className="mb-4">Daily Equipment Log</h4>

        {/* header */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label
              className={`form-label fw-bold${darkMode ? ' text-light' : ''}`}
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
              style={darkMode ? { color: '#f8f9fa' } : {}}
            >
              Project
            </label>
            <Select
              inputId="project-select" // associate label via inputId for react-select
              value={selectedProject}
              onChange={setSelectedProject}
              options={bmProjects.map(p => ({ label: p.name, value: p._id }))}
              placeholder="Select project…"
              isClearable
              styles={{
                maxWidth: '150px',
                control: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#343a40' : '#fff',
                  borderColor: darkMode ? '#495057' : '#ced4da',
                  color: darkMode ? '#fff' : '#000',
                  minHeight: 38,
                  boxShadow: 'none',
                }),
                singleValue: base => ({
                  ...base,
                  color: darkMode ? '#fff' : '#000',
                }),
                input: base => ({
                  ...base,
                  color: darkMode ? '#fff' : '#000',
                }),
                placeholder: base => ({
                  ...base,
                  color: darkMode ? '#adb5bd' : '#6c757d',
                }),
                menu: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#343a40' : '#fff',
                  border: darkMode ? '1px solid #495057' : '1px solid #ced4da',
                  zIndex: 10001,
                  borderRadius: 8,
                  marginTop: 2,
                }),
                menuList: base => ({
                  ...base,
                  maxHeight: 400,
                  overflowY: 'auto',
                  backgroundColor: darkMode ? '#343a40' : '#fff',
                  color: darkMode ? '#fff' : '#000',
                  padding: 0,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#0d55b3'
                    : state.isFocused
                    ? darkMode
                      ? '#495057'
                      : '#f8f9fa'
                    : darkMode
                    ? '#343a40'
                    : '#fff',
                  color: state.isSelected ? '#fff' : darkMode ? '#fff' : '#000',
                  fontSize: 13,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: state.isSelected
                      ? '#0d55b3'
                      : darkMode
                      ? '#495057'
                      : '#c4c8cbff',
                    color: state.isSelected ? '#c4c8cbff' : darkMode ? '#fff' : '#000',
                  },
                }),
              }}
            />
          </div>

          <div className="col-md-4">
            <p
              className={`form-label fw-bold${darkMode ? ' text-light' : ''}`}
              id="log-type-label"
              style={darkMode ? { color: '#f8f9fa' } : {}}
            >
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
            <tr className={`${darkMode ? 'text-light' : 'text-dark'} `}>
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
                  className={`text-center py-3 ${darkMode ? 'text-light' : 'text-dark'} `}
                >
                  Select a project to load equipments.
                </td>
              </tr>
            )}

            {selectedProject && rows.length === 0 && (
              <tr className={`${darkMode ? 'text-light' : 'text-dark'} `}>
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
                        styles={{
                          container: base => ({
                            ...base,
                            width: 300, // lock it to 300px
                            minWidth: 300,
                            maxWidth: 300,
                          }),
                          control: base => ({
                            ...base,
                            width: '100%', // fill the container
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            backgroundColor: darkMode ? '#343a40' : '#fff',
                            borderColor: darkMode ? '#495057' : '#ced4da',
                            color: darkMode ? '#fff' : '#000',
                          }),
                          placeholder: base => ({
                            ...base,
                            color: darkMode ? '#adb5bd' : '#6c757d',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }),
                          singleValue: base => ({
                            ...base,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: darkMode ? '#fff' : '#000',
                          }),
                          multiValue: base => ({
                            ...base,
                            maxWidth: '60%',
                            overflow: 'hidden',
                            backgroundColor: darkMode ? '#495057' : '#e9ecef',
                          }),
                          multiValueLabel: base => ({
                            ...base,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: darkMode ? '#fff' : '#000',
                          }),
                          multiValueRemove: base => ({
                            ...base,
                            color: darkMode ? '#fff' : '#000',
                            '&:hover': {
                              backgroundColor: darkMode ? '#6c757d' : '#dee2e6',
                              color: darkMode ? '#fff' : '#000',
                            },
                          }),
                          indicatorsContainer: base => ({
                            ...base,
                            flexWrap: 'nowrap',
                          }),
                          menu: base => ({
                            ...base,
                            width: 300,
                            minWidth: 300,
                            maxWidth: 300,
                            zIndex: 9999,
                            backgroundColor: darkMode ? '#343a40' : '#fff',
                            border: darkMode ? '1px solid #495057' : '1px solid #ced4da',
                            borderRadius: 8,
                            marginTop: 2,
                          }),
                          menuList: base => ({
                            ...base,
                            maxHeight: 400,
                            overflowY: 'auto',
                            backgroundColor: darkMode ? '#343a40' : '#fff',
                            color: darkMode ? '#fff' : '#000',
                            padding: 0,
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? '#0d55b3'
                              : state.isFocused
                              ? darkMode
                                ? '#495057'
                                : '#f0f0f0'
                              : darkMode
                              ? '#343a40'
                              : '#fff',
                            color: state.isSelected ? '#fff' : darkMode ? '#fff' : '#000',
                            fontSize: 13,
                            padding: '10px 16px',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: state.isSelected
                                ? '#0d55b3'
                                : darkMode
                                ? '#495057'
                                : '#c4c8cbff',
                              color: darkMode ? '#fff' : '#000',
                            },
                          }),
                          menuPortal: base => ({ ...base, zIndex: 9999 }),
                        }}
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

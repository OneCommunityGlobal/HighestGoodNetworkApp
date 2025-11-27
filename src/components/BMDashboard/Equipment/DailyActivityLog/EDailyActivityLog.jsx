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

// Dark mode styles for react-select
const getSelectStyles = darkMode => ({
  container: base => ({
    ...base,
    width: 300,
    minWidth: 300,
    maxWidth: 300,
  }),
  control: (base, state) => ({
    ...base,
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    backgroundColor: darkMode ? '#374151' : '#fff',
    borderColor: darkMode ? '#4B5563' : '#d1d5db',
    color: darkMode ? '#fff' : '#000',
    '&:hover': {
      borderColor: darkMode ? '#6B7280' : '#9CA3AF',
    },
  }),
  input: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
  }),
  placeholder: base => ({
    ...base,
    color: darkMode ? '#9CA3AF' : '#6B7280',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  singleValue: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValue: base => ({
    ...base,
    maxWidth: '60%',
    overflow: 'hidden',
    backgroundColor: darkMode ? '#4B5563' : '#E5E7EB',
  }),
  multiValueLabel: base => ({
    ...base,
    color: darkMode ? '#fff' : '#000',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  multiValueRemove: base => ({
    ...base,
    color: darkMode ? '#9CA3AF' : '#6B7280',
    ':hover': {
      backgroundColor: darkMode ? '#EF4444' : '#DC2626',
      color: '#fff',
    },
  }),
  indicatorsContainer: base => ({
    ...base,
    flexWrap: 'nowrap',
  }),
  dropdownIndicator: base => ({
    ...base,
    color: darkMode ? '#9CA3AF' : '#6B7280',
    ':hover': {
      color: darkMode ? '#D1D5DB' : '#374151',
    },
  }),
  clearIndicator: base => ({
    ...base,
    color: darkMode ? '#9CA3AF' : '#6B7280',
    ':hover': {
      color: darkMode ? '#EF4444' : '#DC2626',
    },
  }),
  menu: base => ({
    ...base,
    width: 300,
    minWidth: 300,
    maxWidth: 300,
    zIndex: 9999,
    backgroundColor: darkMode ? '#374151' : '#fff',
    border: darkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? darkMode
        ? '#4B5563'
        : '#F3F4F6'
      : darkMode
      ? '#374151'
      : '#fff',
    color: darkMode ? '#fff' : '#000',
    ':active': {
      backgroundColor: darkMode ? '#6B7280' : '#E5E7EB',
    },
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }),
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
  const [date, setDate] = useState(TODAY);
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

  const selectStyles = useMemo(() => getSelectStyles(darkMode), [darkMode]);

  return (
    <div
      className={`container-fluid ${darkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
      style={{ minHeight: '100vh', padding: '20px 0' }}
    >
      <div className="container">
        <h4 className="mb-4">Daily Equipment Log</h4>

        {/* header */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label fw-bold" htmlFor="date">
              Date
            </label>
            <input
              type="date"
              id="date"
              className={`form-control ${darkMode ? 'bg-secondary border-dark text-light' : ''}`}
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
              styles={selectStyles}
              classNamePrefix="react-select"
            />
          </div>

          <div className="col-md-4">
            <p className="form-label fw-bold" id="log-type-label">
              Log Type
            </p>
            <ButtonGroup className="d-block" aria-labelledby="log-type-label">
              <Button
                onClick={() => flipLogType('check-in')}
                style={{
                  backgroundColor: logType === 'check-in' ? '#0d6efd' : 'transparent',
                  color: logType === 'check-in' ? '#fff' : '#0d6efd',
                  border: '1px solid #0d6efd',
                  fontWeight: '500',
                }}
              >
                Check In
              </Button>
              <Button
                onClick={() => flipLogType('check-out')}
                style={{
                  backgroundColor: logType === 'check-out' ? '#0d6efd' : 'transparent',
                  color: logType === 'check-out' ? '#fff' : '#0d6efd',
                  border: '1px solid #0d6efd',
                  fontWeight: '500',
                }}
              >
                Check Out
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {/* table */}
        <Table
          bordered
          responsive
          className={darkMode ? 'table-dark' : ''}
          style={{
            border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: '12px',
                  fontWeight: '600',
                  border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  color: darkMode ? '#fff' : '#374151',
                  backgroundColor: darkMode ? '#4B5563' : '#f8f9fa', // Subtle gray background
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: '12px',
                  fontWeight: '600',
                  border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  color: darkMode ? '#fff' : '#374151',
                  backgroundColor: darkMode ? '#4B5563' : '#f8f9fa',
                }}
              >
                Working
              </th>
              <th
                style={{
                  padding: '12px',
                  fontWeight: '600',
                  border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  color: darkMode ? '#fff' : '#374151',
                  backgroundColor: darkMode ? '#4B5563' : '#f8f9fa',
                }}
              >
                Available
              </th>
              <th
                style={{
                  padding: '12px',
                  fontWeight: '600',
                  border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  color: darkMode ? '#fff' : '#374151',
                  backgroundColor: darkMode ? '#4B5563' : '#f8f9fa',
                }}
              >
                Using
              </th>
              <th
                style={{
                  padding: '12px',
                  fontWeight: '600',
                  border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  color: darkMode ? '#fff' : '#374151',
                  backgroundColor: darkMode ? '#4B5563' : '#f8f9fa',
                }}
              >
                Tool / Equipment&nbsp;#
              </th>
            </tr>
          </thead>
          <tbody>
            {!selectedProject && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-3"
                  style={{
                    border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  }}
                >
                  Select a project to load equipments.
                </td>
              </tr>
            )}

            {selectedProject && rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-3"
                  style={{
                    border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                  }}
                >
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
                  <tr key={r.id}>
                    <td
                      style={{
                        border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                      }}
                    >
                      {r.name}
                    </td>
                    <td
                      style={{
                        border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                      }}
                    >
                      {r.workingQty}
                    </td>
                    <td
                      style={{
                        border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                      }}
                    >
                      {r.availableQty}
                    </td>
                    <td
                      style={{
                        border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                      }}
                    >
                      {r.usingQty}
                    </td>
                    <td
                      style={{
                        textAlign: 'center',
                        border: darkMode ? '1px solid #4B5563' : '1px solid #dee2e6',
                      }}
                    >
                      <Select
                        isMulti
                        closeMenuOnSelect={false}
                        value={r.selectedNumbers.map(v => ({ label: v, value: v }))}
                        options={validList.map(n => ({ label: n, value: n }))}
                        onChange={sel => onToolSelect(idx, sel)}
                        placeholder={`Pick up to ${limit}…`}
                        menuPortalTarget={document.body}
                        styles={selectStyles}
                        classNamePrefix="react-select"
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>

        {/* actions */}
        <div className="d-flex justify-content-end gap-4 mt-4">
          <Button
            color="secondary"
            onClick={handleCancel}
            outline={darkMode}
            className={
              darkMode ? 'border-secondary text-secondary px-4 py-2' : 'px-4 py-2 border-secondary'
            }
            style={{
              minWidth: '120px',
              marginRight: '8px',
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            className="px-4 py-2"
            style={{
              minWidth: '120px',
              marginLeft: '8px',
            }}
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

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

  return (
    <div
      className={`container-fluid ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{ height: '100%' }}
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
              inputId="project-select" // associate label via inputId for react-select
              value={selectedProject}
              onChange={setSelectedProject}
              options={bmProjects.map(p => ({ label: p.name, value: p._id }))}
              placeholder="Select project…"
              isClearable
              styles={{ maxWidth: '150px' }}
            />
          </div>

          <div className="col-md-4">
            <p className="form-label fw-bold" id="log-type-label">
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
              <tr>
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
                  <tr key={r.id} className={`${darkMode ? 'text-light' : 'text-dark'} `}>
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
                          }),
                          placeholder: base => ({
                            ...base,
                            color: '#000',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }),
                          singleValue: base => ({
                            ...base,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }),
                          multiValue: base => ({
                            ...base,
                            maxWidth: '60%',
                            overflow: 'hidden',
                          }),
                          multiValueLabel: base => ({
                            ...base,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
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
                          }),
                          option: (base, state) => ({
                            ...base,
                            color: '#000',
                            backgroundColor: state.isFocused ? '#f0f0f0' : '#fff',
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

import { useState, useEffect, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EHistory.module.css';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { fetchAllEquipments } from '~/actions/bmdashboard/equipmentActions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Select from 'react-select';

export default function EquipmentUpdateLog() {
  const dispatch = useDispatch();
  const history = useHistory();
  const bmProjects = useSelector(state => state.bmProjects || []);
  const equipments = useSelector(s => s.bmEquipments?.equipmentslist || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProject, setSelectedProject] = useState({ label: 'All Projects', value: '0' });

  useEffect(() => {
    dispatch(fetchBMProjects());
    // Load all equipment initially
    dispatch(fetchAllEquipments());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject?.value && selectedProject.value !== '0') {
      dispatch(fetchAllEquipments(selectedProject.value));
    } else {
      dispatch(fetchAllEquipments());
    }
  }, [selectedProject, dispatch]);

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const formatPersonName = person => {
    if (!person) return 'N/A';
    const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();
    return fullName || 'N/A';
  };

  // Flatten all log records from all equipment with equipment info
  const logRecords = useMemo(() => {
    const records = [];
    equipments.forEach(equipment => {
      if (equipment.logRecord && equipment.logRecord.length > 0) {
        equipment.logRecord.forEach(log => {
          records.push({
            ...log,
            equipmentName: equipment.itemType?.name || 'N/A',
            equipmentCode: equipment.code || 'N/A',
            equipmentId: equipment._id,
            projectName: equipment.project?.name || 'N/A',
          });
        });
      }
    });
    // Sort by date descending (most recent first)
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [equipments]);

  const filteredLogRecords = useMemo(() => {
    if (!selectedProject?.value || selectedProject.value === '0') {
      return logRecords;
    }
    return logRecords.filter(record => record.projectName === selectedProject.label);
  }, [logRecords, selectedProject]);

  return (
    <div
      className={`container-fluid ${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{ height: '100%' }}
    >
      <div className={`container py-4 ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
        <h3 className={`${darkMode ? 'history-title-dark ' : 'history-title'} fw-bold`}>
          Tool/Equipment History Log
        </h3>

        <div className="row align-items-center mb-4">
          <div className="col-auto d-flex align-items-center">
            <label htmlFor="project-select" className="me-2 mb-0 mr-3">
              Project:{' '}
            </label>
            <Select
              id="project-select"
              value={selectedProject}
              onChange={option =>
                setSelectedProject(option || { label: 'All Projects', value: '0' })
              }
              options={[
                { label: 'All Projects', value: '0' },
                ...bmProjects.map(p => ({ label: p.name, value: p._id })),
              ]}
              placeholder="Select project…"
              isClearable
              styles={{
                container: base => ({ ...base, minWidth: '200px' }),
                control: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                  borderColor: darkMode ? '#334155' : '#ccc',
                  color: darkMode ? '#f1f5f9' : '#000',
                }),
                singleValue: base => ({
                  ...base,
                  color: darkMode ? '#f1f5f9' : '#000',
                }),
                menu: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#1e293b' : '#fff',
                }),
                option: (base, state) => {
                  let backgroundColor = darkMode ? '#1e293b' : '#fff'; // default

                  if (state.isFocused) {
                    backgroundColor = darkMode ? '#334155' : '#eee';
                  } else if (state.isSelected) {
                    backgroundColor = darkMode ? '#475569' : '#ddd';
                  }

                  return {
                    ...base,
                    backgroundColor,
                    color: darkMode ? '#f1f5f9' : '#000',
                    cursor: 'pointer',
                  };
                },
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table
            className={`table ${
              darkMode ? 'equipment-table-dark ' : 'equipment-table'
            }  table-sm equipment-table`}
          >
            <thead>
              <tr>
                <th>SID</th>
                <th>SUBMIT TIME</th>
                <th>PID</th>
                <th>NAME</th>
                <th>PREVIOUS</th>
                <th>CURRENT</th>
                <th>REPLACE</th>
                <th>LAST USED</th>
                <th>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogRecords.length > 0 ? (
                filteredLogRecords.map((record, index) => (
                  <tr key={`${record.equipmentId}-${index}-${record.date}`}>
                    {/* SID */}
                    <td>{index + 1}</td>
                    {/* SUBMIT TIME */}
                    <td>{formatDateTime(record.date)}</td>
                    {/* PID (project name / id) */}
                    <td>{record.projectName}</td>
                    {/* NAME (equipment name) */}
                    <td>{record.equipmentName}</td>
                    {/* PREVIOUS – not available from current API, placeholder */}
                    <td>N/A</td>
                    {/* CURRENT – use log type for now (Check In / Check Out) */}
                    <td>{record.type || 'N/A'}</td>
                    {/* REPLACE – requires backend support, placeholder */}
                    <td>N/A</td>
                    {/* LAST USED – responsible user */}
                    <td>{formatPersonName(record.responsibleUser)}</td>
                    {/* DESCRIPTION – requires backend support, placeholder */}
                    <td>N/A</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center">
                    {selectedProject?.value && selectedProject.value !== '0'
                      ? 'No equipment history records found for the selected project.'
                      : 'No equipment history records found. Please select a project to view history.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-start mt-3">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => history.push('/bmdashboard/equipment')}
          >
            Back to Equipment List
          </button>
        </div>
      </div>
    </div>
  );
}

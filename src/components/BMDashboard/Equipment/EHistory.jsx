import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './EHistory.css';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchAllEquipments } from 'actions/bmdashboard/equipmentActions';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { Link } from 'react-router-dom';

export default function EquipmentUpdateLog() {
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects || []);
  const equipments = useSelector(s => s.bmEquipments?.equipmentslist || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProject?.value) {
      dispatch(fetchAllEquipments(selectedProject.value));
    }
  }, [selectedProject, dispatch]);

  const formatDate = iso => (iso ? new Date(iso).toLocaleString() : '-');

  // 🌟 Dummy rows with dummy dates
  const dummyRows = [
    {
      date: '2024-07-01T09:00:00Z',
      previous: 'Working well',
      current: 'Good',
      replace: 'No',
      lastUsed: 'N/A',
      description: 'Initial condition',
    },
    {
      date: '2024-08-15T14:30:00Z',
      previous: 'Good',
      current: 'Needs Repair',
      replace: 'Yes',
      lastUsed: 'John Doe',
      description: 'Reported damage',
    },
  ];

  // Build rows
  const updateEntries = equipments
    .filter(item => !selectedProject || item.project?._id === selectedProject.value)
    .flatMap(item => {
      if (item.updateRecord && item.updateRecord.length > 0) {
        return item.updateRecord.map(entry => ({ entry, equipment: item }));
      }
      return dummyRows.map(dummy => ({
        entry: null,
        equipment: item,
        dummy,
      }));
    });

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
            <label className="me-2 mb-0 mr-3">Project: </label>
            <Select
              value={selectedProject}
              onChange={option => setSelectedProject(option)}
              options={bmProjects.map(p => ({ label: p.name, value: p._id }))}
              placeholder="All Projects"
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
                <th>Submit Time</th>
                <th>PID</th>
                <th>Name</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Replace</th>
                <th>Last Used</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {updateEntries.length > 0 ? (
                updateEntries.map(({ entry, equipment, dummy }, idx) => (
                  <tr key={(entry && entry._id) || `dummy-${equipment._id}-${idx}`}>
                    <td>{idx + 1}</td>
                    <td>{entry ? formatDate(entry.date) : formatDate(dummy.date)}</td>
                    <td>{equipment.project?.name || '-'}</td>
                    <td>{equipment.itemType?.name || equipment.name || 'Unknown'}</td>
                    <td>{entry ? '-' : dummy.previous}</td>
                    <td>{entry ? entry.condition : dummy.current}</td>
                    <td>{entry ? '-' : dummy.replace}</td>
                    <td>{entry ? entry.createdBy || '-' : dummy.lastUsed}</td>
                    <td>{entry ? '-' : dummy.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center">
                    No history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-start mt-3">
          <Link to="/equipment-tools">
            <button className="btn btn-primary" type="button">
              Back to Equipment/Tools List
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

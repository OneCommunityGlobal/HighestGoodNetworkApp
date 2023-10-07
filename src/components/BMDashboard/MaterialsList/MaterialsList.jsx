import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import MaterialsTable from './MaterialsTable';

export function MaterialsList(props) {
  // console.log('materials props: ', props);
  // props & state
  const { materials, errors } = props;
  const [filteredMaterials, setFilteredMaterials] = useState(materials);
  const [selectedProject, setSelectedProject] = useState('all');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ status: '', message: '' });

  // dispatch materials fetch action
  // response is mapped to materials or errors in redux store
  useEffect(() => {
    props.dispatch(fetchAllMaterials());
  }, []);

  // filter materials data by project
  useEffect(() => {
    if (selectedProject === 'all') {
      return setFilteredMaterials(materials);
    }
    const filterMaterials = materials.filter(mat => mat.project.projectName === selectedProject);
    setFilteredMaterials(filterMaterials);
  }, [selectedProject]);

  // error handling
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
      // no response object if server is offline
      if (!errors.response) {
        return setError({
          status: 503,
          message: 'The server is temporarily offline. Please try again later.',
        });
      }
      setError({
        status: errors.response.status,
        message: errors.response.statusText,
      });
    }
  }, [errors]);

  if (isError) {
    return (
      <main className="container mt-3">
        <h2>Materials List</h2>
        <BMError error={error} />
      </main>
    );
  }

  return (
    <main className="container mt-3">
      <h3>Materials</h3>
      <section style={{ marginTop: '2rem' }}>
        <SelectForm materials={materials} setSelectedProject={setSelectedProject} />
        <MaterialsTable filteredMaterials={filteredMaterials} />
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  // auth: state.auth,
  materials: state.materials,
  errors: state.errors,
});

export default connect(mapStateToProps)(MaterialsList);

import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import MaterialsTable from './MaterialsTable';
import './MaterialsList.css';

export function MaterialsList(props) {
  // props & state
  const { materials, errors, dispatch } = props;
  const [filteredMaterials, setFilteredMaterials] = useState(materials);
  const [selectedProject, setSelectedProject] = useState('all');
  const [isError, setIsError] = useState(false);
  const postMaterialUpdateResult = useSelector(state => state.updateMaterials)

  // dispatch materials fetch action
  // response is mapped to materials or errors in redux store
  useEffect(() => {
    if (postMaterialUpdateResult.result != null && postMaterialUpdateResult.loading == false)
      dispatch(fetchAllMaterials());
  }, [postMaterialUpdateResult.result]);

  // filter materials data by project
  useEffect(() => {
    if (selectedProject === 'all') {
      return setFilteredMaterials(materials);
    }
    const filterMaterials = materials.filter(mat => mat.project.name === selectedProject);
    return setFilteredMaterials(filterMaterials);
  }, [selectedProject, materials]);

  // trigger error state if an error object is added to props
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  // error state
  if (isError) {
    return (
      <main className="materials_list_container">
        <h2>Materials List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="materials_list_container">
      <h3>Materials</h3>
      <section>
        <SelectForm materials={materials} setSelectedProject={setSelectedProject} />
        <MaterialsTable filteredMaterials={filteredMaterials} />
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  materials: state.materials,
  errors: state.errors,
});

export default connect(mapStateToProps)(MaterialsList);

import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectMaterial from './SelectMaterial';
import MaterialsTable from './MaterialsTable';
import './MaterialsList.css';

export function MaterialsList(props) {
  // props & state
  const { materials, errors, dispatch } = props;
  const [filteredMaterials, setFilteredMaterials] = useState(materials);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [isError, setIsError] = useState(false);
  const postMaterialUpdateResult = useSelector(state => state.materials.updateMaterials);

  // dispatch materials fetch action : on load and update
  // // response is mapped to materials or errors in redux store
  useEffect(() => {
    if (!postMaterialUpdateResult || postMaterialUpdateResult?.result == null) dispatch(fetchAllMaterials());
  }, [postMaterialUpdateResult?.result]); // To refresh with new materials after update

  useEffect(() => {
    if (materials)
      setFilteredMaterials([...materials]);
  }, [materials]);

  // filter materials data by project
  useEffect(() => {
    let filterMaterials;
    if (!materials) return;
    if (selectedProject === 'all' && selectedMaterial === 'all') {
      setFilteredMaterials([...materials]);
    } else if (selectedProject !== 'all' && selectedMaterial === 'all') {
      filterMaterials = materials.filter(mat => mat.project?.name === selectedProject);
      setFilteredMaterials([...filterMaterials]);
    } else if (selectedProject === 'all' && selectedMaterial !== 'all') {
      filterMaterials = materials.filter(mat => mat.itemType?.name === selectedMaterial);
      setFilteredMaterials([...filterMaterials]);
    } else {
      filterMaterials = materials.filter(
        mat => mat.project?.name === selectedProject && mat.itemType?.name === selectedMaterial,
      );
      setFilteredMaterials([...filterMaterials]);
    }
  }, [selectedProject, selectedMaterial]);

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
        <span style={{ display: 'flex', margin: '5px' }}>
          {
            materials &&
            <>
              <SelectForm
                materials={materials}
                setSelectedProject={setSelectedProject}
                setSelectedMaterial={setSelectedMaterial}
              />
              <SelectMaterial
                materials={materials}
                selectedProject={selectedProject}
                selectedMaterial={selectedMaterial}
                setSelectedMaterial={setSelectedMaterial}
              />
            </>
          }
        </span>
        {filteredMaterials && <MaterialsTable filteredMaterials={filteredMaterials} />}
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  materials: state.materials.materialslist,
  errors: state.errors,
});

export default connect(mapStateToProps)(MaterialsList);

import { useState, useEffect } from 'react';
import { connect } from 'react-redux';

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
  const [selectedMaterial,setSelectedMaterial]= useState('all');
  const [isError, setIsError] = useState(false);

  // dispatch materials fetch action
  // response is mapped to materials or errors in redux store
  useEffect(() => {
    dispatch(fetchAllMaterials());
  }, []);

  // filter materials data by project
  useEffect(() => {
    
    let  filterMaterials;
    if (selectedProject === 'all' && selectedMaterial==='all')  {
      setFilteredMaterials(materials);
    }
    else if(selectedProject != 'all' && selectedMaterial==='all')
    {
      filterMaterials = materials.filter(mat => mat.project.projectName === selectedProject)
      setFilteredMaterials(filterMaterials);
    }
    else
    {
      filterMaterials = materials.filter(mat => mat.project.projectName === selectedProject && mat.inventoryItemType?.name===selectedMaterial);
      setFilteredMaterials(filterMaterials);
    }   
  }, [selectedProject,selectedMaterial]);
 

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
        <span style={{display:'flex', margin:'5px'}}>
        <SelectForm materials={materials} setSelectedProject={setSelectedProject} setSelectedMaterial={setSelectedMaterial}/>
        <SelectMaterial materials={materials}  selectedProject={selectedProject} selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial}/>
        </span>
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

import { useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
// import { useLocation } from 'react-router-dom';
import { getAllItemTypes } from 'actions/itemTypes';
import { fetchAllProjects } from 'actions/projects';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';
import './AddMaterials.css';

export default function AddMaterials() {
  const allProjects = useSelector(state => state.allProjects);
  const itemTypes = useSelector(state => state.itemTypes);
  const dispatch = useDispatch();

  // expecting a state object with the project object selected
  // from the BM Dashboard or if selected project will be added to state
  // const { state } = useLocation();
  // const { selectedProject } = state;

  useEffect(() => {
    dispatch(fetchAllProjects());
    dispatch(getAllItemTypes());
  }, []);

  // creates Set object including all unique units of measurement
  const measurements = new Set();
  itemTypes.allItemTypes.forEach(itemType => {
    measurements.add(itemType.uom);
  });

  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm
        projects={allProjects.projects}
        // selectedProject={ selectedProject }
        canAddNewMaterial // permission to be added
        canAddNewMeasurement // permission to be added
        materials={itemTypes.allItemTypes.filter(item => item.type === 'material')}
        measurements={[...measurements]}
      />
    </Container>
  );
}

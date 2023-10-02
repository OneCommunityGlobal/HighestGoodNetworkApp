import { useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
// import { useLocation } from 'react-router-dom';
import './AddMaterials.css';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';
import { fetchAllProjects } from '../../../actions/projects';

export default function AddMaterials() {
  const allProjects = useSelector(state => state.allProjects);
  const dispatch = useDispatch();

  const materialList = ['Gravel', 'Sand', 'Brick'];
  const measurementList = ['Cubic Yard', 'Cubic Foot'];
  // expecting a state object with the project object selected
  // from the BM Dashboard
  // const { state } = useLocation();

  useEffect(() => {
    dispatch(fetchAllProjects());
  }, []);

  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm
        allProjects={allProjects.projects}
        // selectedProject={allProjects.projects[3]}
        canAddNewMaterial
        canAddNewMeasurement
        materialList={materialList}
        measurementList={measurementList}
      />
    </Container>
  );
}

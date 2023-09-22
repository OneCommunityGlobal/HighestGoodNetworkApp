import { useEffect } from 'react';
import { Container } from 'reactstrap';
import { useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
import './AddMaterials.css';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';
import { fetchAllProjects } from '../../../actions/projects';

export default function AddMaterials() {
  const allProjects = useSelector(state => state.allProjects);
  // expecting a state object with the project object selected
  // from the BM Dashboard
  // const { state } = useLocation();

  useEffect(() => {
    fetchAllProjects();
  }, []);

  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm
        allProjects={allProjects.projects}
        // selectedProject={state.project}
        canAddNewMaterial
      />
    </Container>
  );
}

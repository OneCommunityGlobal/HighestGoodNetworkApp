import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
// import { useLocation } from 'react-router-dom';
import './AddMaterials.css';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';

export default function AddMaterials() {
  const projects = useSelector(state => state.allProjects);
  const [materials, setMaterials] = useState([]);
  const [measurements, setMeasurements] = useState(['Cubic Yard', 'Cubic Foot']);

  // expecting a state object with the project object selected
  // from the BM Dashboard
  // const { state } = useLocation();

  useEffect(() => {
    const url = ENDPOINTS.BM_GET_INVENTORY_TYPES;

    axios
      .get(url)
      .then(result => {
        const materialList = result.data.filter(invItem => invItem.type === 'material');
        setMaterials(materialList);
      })
      .catch(error => console.log(error));
  }, []);

  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm
        projects={projects.projects}
        // selectedProject={allProjects.projects[3]}
        canAddNewMaterial
        canAddNewMeasurement
        materialList={materials}
        measurementList={measurements}
      />
    </Container>
  );
}

import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
// import { useLocation } from 'react-router-dom';
import './AddMaterials.css';
import { getAllItemTypes } from 'actions/itemTypes';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';

export default function AddMaterials() {
  const allProjects = useSelector(state => state.allProjects);
  const itemTypes = useSelector(state => state.itemTypes.allItemTypes);
  const dispatch = useDispatch();

  // expecting a state object with the project object selected
  // from the BM Dashboard
  // const { state } = useLocation();

  useEffect(() => {
    dispatch(getAllItemTypes());
  }, []);

  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm
        projects={allProjects.projects}
        // selectedProject={allProjects.projects[3]}
        canAddNewMaterial
        canAddNewMeasurement
        materials={itemTypes.filter(item => item.type === 'material')}
        measurements={['Cubic Yard', 'Cubic Foot']}
      />
    </Container>
  );
}

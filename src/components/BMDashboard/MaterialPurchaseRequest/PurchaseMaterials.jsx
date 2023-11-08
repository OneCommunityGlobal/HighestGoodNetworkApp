import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'reactstrap';
// import { useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
// import { getAllItemTypes } from 'actions/itemTypes';
// import { fetchAllProjects } from 'actions/projects';
import PurchaseForm from './PurchaseForm';
import './PurchaseMaterials.css';

export default function PurchaseMaterials() {
  const [projects, setProjects] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  console.log(materialTypes);
  console.log(projects);
  // const allProjects = useSelector(state => state.allProjects);
  // const itemTypes = useSelector(state => state.itemTypes);

  const APIEndpoint =
    process.env.REACT_APP_APIENDPOINT || 'https://hgn-rest-beta.azurewebsites.net/api';
  useEffect(() => {
    const fetchData = async () => {
      const { data: projectData } = await axios.get(`${APIEndpoint}/bm/projects`);
      setProjects(projectData);
      const { data: materialData } = await axios.get(`${APIEndpoint}/bm/invtypes/materials`);
      setMaterialTypes(materialData);
    };
    fetchData();
  }, []);

  // creates Set object including all unique units of measurement
  // const measurements = new Set();
  // itemTypes.allItemTypes.forEach(itemType => {
  //   measurements.add(itemType.uom);
  // });

  return (
    <Container fluid className="add-materials-page">
      <div className="purchase-materials-header">
        <h2>Purchase Request: Materials</h2>
        <p>
          Important: This form initiates a purchase request for approval/action by project admins.
        </p>
      </div>
      <PurchaseForm
        projects={projects}
        materialTypes={materialTypes}
        // selectedProject={ selectedProject }
        // canAddNewMaterial // permission to be added
        // canAddNewMeasurement // permission to be added
        // materials={itemTypes.allItemTypes.filter(item => item.type === 'material')}
        // measurements={[...measurements]}
      />
    </Container>
  );
}

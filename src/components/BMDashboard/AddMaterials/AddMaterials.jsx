import { Container } from 'reactstrap';
import './AddMaterials.css';
import AddMaterialForm from './AddMaterialForm/AddMaterialForm';

export default function AddMaterials() {
  const projects = [
    {
      _id: 1,
      projectName: 'Project_1',
    },
    {
      _id: 2,
      projectName: 'Project_2',
    },
  ];
  return (
    <Container fluid className="add-materials-page">
      <AddMaterialForm projects={projects} />
    </Container>
  );
}

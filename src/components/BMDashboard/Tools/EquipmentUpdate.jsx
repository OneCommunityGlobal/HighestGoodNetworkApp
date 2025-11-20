import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import EquipmentUpdateForm from './EquipmentUpdateForm';
import './EquipmentUpdate.css';

export default function EquipmentUpdate() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <div className="equipment-update-page-wrapper">
        <main className="equipment-update-container">
          <header className="equipment-update-header">
            <h2>Which Tool or Equipment to Update</h2>
          </header>

          <EquipmentUpdateForm />
        </main>
      </div>
    </Container>
  );
}

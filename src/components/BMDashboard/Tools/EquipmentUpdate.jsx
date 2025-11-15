import EquipmentUpdateForm from './EquipmentUpdateForm';
import './EquipmentUpdate.css';

export default function EquipmentUpdate() {
  return (
    <main className="equipment-update-container">
      <header className="equipment-update-header">
        <h2>Which Tool or Equipment to Update</h2>
      </header>
      <EquipmentUpdateForm />
    </main>
  );
}

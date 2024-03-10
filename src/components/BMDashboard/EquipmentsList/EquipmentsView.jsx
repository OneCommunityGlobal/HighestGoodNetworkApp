import { useState } from 'react';
import EquipmentsTable from './EquipmentsTable';
import EquipmentsInputs from './EquipmentsInputs';
import './Equipments.css';

function EquipmentsView() {
  const [equipment, setEquipment] = useState({ label: 'All Equipments', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });

  return (
    <div className="PageViewContainer">
      <div className="Page">
        <div className="Box">
          <div className="BuildingTitle">EQUIPMENTS</div>
          <EquipmentsInputs
            equipment={equipment}
            setEquipment={setEquipment}
            project={project}
            setProject={setProject}
          />
          <EquipmentsTable
            equipment={equipment}
            setEquipment={setEquipment}
            project={project}
            setProject={setProject}
          />
        </div>
      </div>
    </div>
  );
}

export default EquipmentsView;

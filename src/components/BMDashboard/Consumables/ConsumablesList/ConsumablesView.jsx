import { useState, useEffect } from 'react';
import ConsumablesTable from './ConsumablesTable';
import ConsumablesInputs from './ConsumablesInputs';
import './Consumables.css';

function ConsumablesView() {
  const [consumable, setConsumable] = useState({ label: 'All Consumables', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });

  return (
    <div className="PageViewContainer">
      <div className="Page">
        <div className="Box">
          <div className="BuildingTitle">CONSUMABLES</div>
          <ConsumablesInputs
            consumable={consumable}
            setConsumable={setConsumable}
            project={project}
            setProject={setProject}
          />
          <ConsumablesTable
            consumable={consumable}
            setConsumable={setConsumable}
            project={project}
            setProject={setProject}
          />
        </div>
      </div>
    </div>
  );
}

export default ConsumablesView;

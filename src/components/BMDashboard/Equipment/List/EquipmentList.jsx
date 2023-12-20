import { useState } from 'react';
import { Button } from 'reactstrap';

import AddEquipmentModal from '../AddType/AddEquipmentModal';

export default function EquipmentList() {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(prev => !prev);
  return (
    <main style={{ margin: '1rem', padding: '0 1rem ' }}>
      <h3>Equipment</h3>
      <Button color="primary" size="lg" onClick={toggle}>
        + Add Equipment Type
      </Button>
      <AddEquipmentModal modal={modal} toggle={toggle} />
    </main>
  );
}

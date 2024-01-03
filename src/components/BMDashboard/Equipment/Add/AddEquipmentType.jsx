import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';
import { Button } from 'reactstrap';

import BMError from 'components/BMDashboard/shared/BMError';
import CheckTypesModal from 'components/BMDashboard/shared/CheckTypesModal';
import AddTypeForm from './AddTypeForm';
import '../../BMDashboard.css';

export default function AddEquipmentType() {
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggle = () => setShowModal(prev => !prev);

  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  if (isError) {
    return (
      <main className="bm-error-page">
        <h2>Add Type: Equipment</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="inv-form-page-container">
      <CheckTypesModal showModal={showModal} toggle={toggle} />
      <header>
        <h2>Add Type: Equipment</h2>
        <div className="inv-form-info">
          <BsInfoCircle />
          Add a new type of equipment so it can be purchased and used in projects
        </div>
        <Button size="sm" outline color="primary" onClick={toggle}>
          Check Types
        </Button>
      </header>
      <AddTypeForm />
    </main>
  );
}

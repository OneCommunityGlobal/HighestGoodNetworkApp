import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BiInfoCircle } from 'react-icons/bi';

import BMError from 'components/BMDashboard/shared/BMError';
import AddTypeForm from './AddTypeForm';
import '../../BMDashboard.css';

export default function AddEquipmentType() {
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);

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
      <header>
        <h2>Add Type: Equipment</h2>
        <p className="inv-form-info">
          <BiInfoCircle />
          Add a new type of equipment so it can be purchased and used in projects.
        </p>
      </header>
      <AddTypeForm />
    </main>
  );
}

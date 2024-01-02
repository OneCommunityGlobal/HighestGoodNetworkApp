import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

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
    return <div>{JSON.stringify(errors)}</div>;
  }

  return (
    <main className="inv-form-page-container">
      <header>
        <h2>Add Type: Equipment</h2>
      </header>
      <AddTypeForm />
    </main>
  );
}

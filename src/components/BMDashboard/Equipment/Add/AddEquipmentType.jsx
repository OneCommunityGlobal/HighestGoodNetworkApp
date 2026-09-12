import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';
import BMError from '~/components/BMDashboard/shared/BMError';
import styles from '../../BMDashboard.module.css';
import { Button } from 'reactstrap';
import CheckTypesModal from '~/components/BMDashboard/shared/CheckTypesModal';
import AddTypeForm from './AddTypeForm';

export default function AddEquipmentType() {
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  if (isError) {
    return (
      <main className={`${styles.bmErrorPage}`}>
        <h2>Add Type: Equipment</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.invFormPageContainer}`}>
      <CheckTypesModal modal={modal} setModal={setModal} type="Equipments" />
      <header>
        <h2>Add Type: Equipment</h2>
        <div className={`${styles.invFormInfo}`}>
          <BsInfoCircle />
          Add a new type of equipment so it can be purchased and used in projects
        </div>
        <Button size="sm" outline color="primary" onClick={() => setModal(true)}>
          Check Types
        </Button>
      </header>
      <AddTypeForm />
    </main>
  );
}

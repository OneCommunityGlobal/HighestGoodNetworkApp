/* eslint-disable import/no-unresolved */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';

import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchEquipmentTypes } from 'actions/bmdashboard/invTypeActions';
import BMError from '../shared/BMError';
import PurchaseForm from './PurchaseForm';
import './PurchaseEquipment.css';

export default function PurchaseEquipment() {
  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchEquipmentTypes());
  }, []);

  // trigger error state if an error object is added to props
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  // error state
  if (isError) {
    return (
      <main className="equipments_list_container">
        <h2>Equipments List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="purchase-equipment-container">
      <header className="purchase-equipment-header">
        <h2>Purchase Request: Equipments</h2>
        <div className="inv-form-info">
          <BsInfoCircle />
          Initiate a purchase request for approval/action by project admins.
        </div>
      </header>
      <PurchaseForm />
    </main>
  );
}

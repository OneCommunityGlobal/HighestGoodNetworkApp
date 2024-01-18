import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchConsumableTypes } from 'actions/bmdashboard/invTypeActions';
import BMError from '../shared/BMError';
import PurchaseForm from './PurchaseForm';
import './PurchaseConsumable.css';

export default function PurchaseConsumable() {
  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchConsumableTypes());
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
      <main className="consumables_list_container">
        <h2>Consumables List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="purchase-consumable-container">
      <header className="purchase-consumable-header">
        <h2>Purchase Request: Consumables</h2>
        <p>
          Important: This form initiates a purchase request for approval/action by project admins.
        </p>
      </header>
      <PurchaseForm />
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import BMError from '../shared/BMError';
import PurchaseForm from './PurchaseForm';
import './PurchaseMaterials.css';

export default function PurchaseMaterials() {
  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchMaterialTypes());
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
      <main className="materials_list_container">
        <h2>Materials List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="purchase-material-container">
      <header className="purchase-materials-header">
        <h2>Purchase Request: Materials</h2>
        <p>
          Important: This form initiates a purchase request for approval/action by project admins.
        </p>
      </header>
      <PurchaseForm />
    </main>
  );
}

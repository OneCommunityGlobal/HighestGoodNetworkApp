/* eslint-disable import/no-named-as-default */
/* eslint-disable import/namespace */
/* eslint-disable import/no-unresolved */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BsInfoCircle } from 'react-icons/bs';

import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { fetchToolTypes } from '~/actions/bmdashboard/invTypeActions';
import BMError from '../shared/BMError';
// eslint-disable-next-line import/default, import/no-named-as-default-member
import PurchaseForm from './PurchaseForm';
import styles from './PurchaseTool.module.css';

export default function PurchaseTool() {
  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchToolTypes());
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
      <main className="tools_list_container">
        <h2>Tools List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className={`${styles.purchaseToolContainer}`}>
      <header className={`${styles.purchaseToolHeader}`}>
        <h2>Purchase Request: Tools</h2>
        <div className="inv-form-info">
          <BsInfoCircle />
          Initiate a purchase request for approval/action by project admins.
        </div>
      </header>
      <PurchaseForm />
    </main>
  );
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import { purchaseMaterial } from 'actions/bmdashboard/materialsActions';
import PurchaseForm from '../PurchaseForm';

const formLabels = {
  headerText: 'Purchase Request: Materials',
  headerSubText:
    'Important: This form initiates a purchase request for approval/action by project admins.',
  primarySelectLabel: 'Project',
  primarySelectDefaultOption: 'Select Project...',
  secondarySelectLabel: 'Material',
  secondarySelectDefaultOption: 'Select Material...',
  quantityLabel: 'Quantity',
  priorityLabel: 'Priority',
  brandLabel: 'Preferred Brand (optional)',
};

function MaterialPurchaseForm() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/bmdashboard/materials/purchase')) {
      document.title = 'Materials Purchase Request Form';
    }
  }, [location]);

  return (
    <PurchaseForm
      fetchPrimaryDataAction={fetchBMProjects}
      fetchSecondaryDataAction={fetchMaterialTypes}
      submitFormAction={purchaseMaterial}
      primaryDataSelector={state => state.bmProjects}
      secondaryDataSelector={state => state.bmInvTypes.list}
      errorSelector={state => state.errors}
      formLabels={formLabels}
    />
  );
}

export default MaterialPurchaseForm;

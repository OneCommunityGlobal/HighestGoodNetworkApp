import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchReusableTypes } from 'actions/bmdashboard/invTypeActions';
import { purchaseReusable } from 'actions/bmdashboard/reusableActions';
import PurchaseForm from '../PurchaseForm';

const formLabels = {
  headerText: 'Purchase Request: Reusable Items',
  headerSubText: 'Important: This form initiates a purchase request...',
  primarySelectLabel: 'Project',
  primarySelectDefaultOption: 'Select Project...',
  secondarySelectLabel: 'Reusable Item',
  secondarySelectDefaultOption: 'Select Reusable Item...',
  quantityLabel: 'Quantity',
  priorityLabel: 'Priority',
  brandLabel: 'Preferred Brand (optional)',
};

function ReusablePurchaseForm() {
  return (
    <PurchaseForm
      fetchPrimaryDataAction={fetchBMProjects}
      fetchSecondaryDataAction={fetchReusableTypes}
      submitFormAction={purchaseReusable}
      primaryDataSelector={state => state.bmProjects || []}
      secondaryDataSelector={state => state.bmInvTypes.list || []}
      errorSelector={state => state.errors}
      formLabels={formLabels}
    />
  );
}

export default ReusablePurchaseForm;

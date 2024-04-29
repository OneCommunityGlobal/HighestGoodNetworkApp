import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchEquipmentTypes } from 'actions/bmdashboard/invTypeActions';
import { purchaseEquipment } from 'actions/bmdashboard/equipmentActions';
import PurchaseForm from '../PurchaseForm';

const formLabels = {
  headerText: 'Purchase Request: Equipments',
  headerSubText:
    'Important: This form initiates a purchase request for approval/action by project admins.',
  primarySelectLabel: 'Project',
  primarySelectDefaultOption: 'Select Project...',
  secondarySelectLabel: 'Equipment',
  secondarySelectDefaultOption: 'Select Equipment...',
  quantityLabel: 'Quantity',
  priorityLabel: 'Priority',
  brandLabel: 'Preferred Brand (optional)',
};

function EquipmentPurchaseForm() {
  return (
    <PurchaseForm
      fetchPrimaryDataAction={fetchBMProjects}
      fetchSecondaryDataAction={fetchEquipmentTypes}
      submitFormAction={purchaseEquipment}
      primaryDataSelector={state => state.bmProjects}
      secondaryDataSelector={state => state.bmInvTypes.list}
      errorSelector={state => state.errors}
      formLabels={formLabels}
    />
  );
}

export default EquipmentPurchaseForm;

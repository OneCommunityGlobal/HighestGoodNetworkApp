import React from 'react';
import PurchaseForm from "../PurchaseForm"
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchMaterialTypes } from 'actions/bmdashboard/invTypeActions';
import { purchaseMaterial } from 'actions/bmdashboard/materialsActions';

const formLabels = {
  headerText: "Purchase Request: Materials",
  headerSubText: "Important: This form initiates a purchase request for approval/action by project admins.",
  primarySelectLabel: "Project",
  primarySelectDefaultOption: "Select Project...",
  secondarySelectLabel: "Material",
  secondarySelectDefaultOption: "Select Material...",
  quantityLabel: "Quantity",
  priorityLabel: "Priority",
  brandLabel: "Preferred Brand (optional)",
  cancelButtonText: "Cancel",
  submitButtonText: "Submit"
};

const MaterialPurchaseForm = () => {
  return <PurchaseForm
    fetchPrimaryDataAction={fetchBMProjects}
    fetchSecondaryDataAction={fetchMaterialTypes}
    submitFormAction={purchaseMaterial}
    primaryDataSelector={state => state.bmProjects}
    secondaryDataSelector={state => state.bmInvTypes.list}
    errorSelector={state => state.errors}
    formLabels={formLabels} />

}

export default MaterialPurchaseForm;
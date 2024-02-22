import React from 'react';
import PurchaseForm from "../PurchaseForm"
import { fetchBMProjects } from 'actions/bmdashboard/projectActions';
import { fetchReusableTypes } from 'actions/bmdashboard/invTypeActions';
import { purchaseReusable } from 'actions/bmdashboard/reusableActions';

const formLabels = {
  headerText: "Purchase Request: Reusable Items",
  headerSubText: "Important: This form initiates a purchase request for reusable items for approval/action by project admins.",
  primarySelectLabel: "Project",
  primarySelectDefaultOption: "Select Project...",
  secondarySelectLabel: "Reusable Item",
  secondarySelectDefaultOption: "Select Reusable Item...",
  quantityLabel: "Quantity",
  priorityLabel: "Priority",
  brandLabel: "Preferred Brand (optional)",
};

const ReusablePurchaseForm = () => {
  return <PurchaseForm
    fetchPrimaryDataAction={fetchBMProjects}
    fetchSecondaryDataAction={fetchReusableTypes}
    submitFormAction={purchaseReusable}
    primaryDataSelector={state => state.bmProjects}
    secondaryDataSelector={state => state.bmInvTypes.list}
    errorSelector={state => state.errors}
    formLabels={formLabels} />
}

export default ReusablePurchaseForm;
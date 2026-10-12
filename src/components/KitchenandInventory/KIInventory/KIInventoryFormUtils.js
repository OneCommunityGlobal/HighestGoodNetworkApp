const requiredTextFields = ['name', 'type', 'unit', 'location'];
const requiredNumericFields = ['presentQuantity', 'storedQuantity', 'reorderAt', 'monthlyUsage'];
const optionalNumericFields = ['nextHarvestQuantity'];
const requiredDateFields = ['expiryDate'];

const fieldLabels = {
  name: 'Item name',
  type: 'Type',
  unit: 'Unit',
  location: 'Location',
  presentQuantity: 'Current stock',
  storedQuantity: 'Stored quantity',
  reorderAt: 'Reorder threshold',
  monthlyUsage: 'Monthly usage',
  nextHarvestQuantity: 'Next harvest quantity',
  expiryDate: 'Expiry date',
  lastHarvestDate: 'Last harvest date',
  nextHarvestDate: 'Next harvest date',
};

export const toNumber = Number;

export const getTodayDateValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export function validateInventoryItemForm(formData) {
  const errors = {};
  const todayDateValue = getTodayDateValue();

  requiredTextFields.forEach(field => {
    if (!formData[field].trim()) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  });

  requiredNumericFields.forEach(field => {
    const numericValue = toNumber(formData[field]);
    if (formData[field] === '' || !Number.isFinite(numericValue) || numericValue < 0) {
      errors[field] = `${fieldLabels[field]} must be a non-negative number.`;
    }
  });

  optionalNumericFields.forEach(field => {
    if (formData[field] === '') {
      return;
    }

    const numericValue = toNumber(formData[field]);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      errors[field] = `${fieldLabels[field]} must be a non-negative number.`;
    }
  });

  requiredDateFields.forEach(field => {
    if (!formData[field]) {
      errors[field] = `${fieldLabels[field]} is required.`;
    }
  });

  if (formData.expiryDate && formData.expiryDate < todayDateValue) {
    errors.expiryDate = 'Expiry date must be today or a future date.';
  }

  if (formData.lastHarvestDate && formData.lastHarvestDate > todayDateValue) {
    errors.lastHarvestDate = 'Last harvest date cannot be in the future.';
  }

  if (formData.nextHarvestDate && formData.nextHarvestDate < todayDateValue) {
    errors.nextHarvestDate = 'Next harvest date must be today or a future date.';
  }

  const presentQuantity = toNumber(formData.presentQuantity);
  const storedQuantity = toNumber(formData.storedQuantity);
  if (!errors.presentQuantity && !errors.storedQuantity && storedQuantity < presentQuantity) {
    errors.storedQuantity = 'Stored quantity must be greater than or equal to current stock.';
  }

  return errors;
}

export function buildInventoryItemBasePayload(formData, categoryValue) {
  return {
    name: formData.name.trim(),
    type: formData.type.trim(),
    unit: formData.unit.trim(),
    location: formData.location.trim(),
    category: categoryValue,
    onsite: formData.onsite,
    presentQuantity: toNumber(formData.presentQuantity),
    storedQuantity: toNumber(formData.storedQuantity),
    reorderAt: toNumber(formData.reorderAt),
    monthlyUsage: toNumber(formData.monthlyUsage),
  };
}

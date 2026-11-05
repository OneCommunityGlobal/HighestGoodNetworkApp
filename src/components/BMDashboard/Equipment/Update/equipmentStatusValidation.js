export const CONDITIONS = ['Good', 'Needs Repair', 'Out of Order'];

export function equipmentIdentityError(record, equipmentId) {
  if (!/^[a-f\d]{24}$/i.test(equipmentId || ''))
    return 'Invalid equipment identifier. Check the equipment link.';
  if (!record || typeof record !== 'object' || Array.isArray(record) || !record._id) {
    return 'Equipment record is missing or invalid. Check the equipment link.';
  }
  if (record._id !== equipmentId)
    return 'The returned equipment does not match this link. Status updates are disabled.';
  if (record.__t != null && (typeof record.__t !== 'string' || record.__t !== 'equipment_item')) {
    return 'This record is not supported. This form updates Equipment only.';
  }
  return '';
}

export function validateEquipmentStatus(values) {
  const errors = {};
  if (!CONDITIONS.includes(values.status))
    errors.status = 'Select Good, Needs Repair, or Out of Order.';
  [
    ['lastUsedBy', 'lastUsedByOther', 200],
    ['lastUsedFor', 'lastUsedForOther', 500],
  ].forEach(([field, other, limit]) => {
    const value = values[field] === 'other' ? values[other] : values[field];
    const key = values[field] === 'other' ? other : field;
    if (typeof value !== 'string' || !value.trim()) errors[key] = 'This field is required.';
    else if (value.length > limit) errors[key] = `Use no more than ${limit} characters.`;
  });
  if (!['', 'yes', 'no', true, false].includes(values.replacementRequired)) {
    errors.replacementRequired = 'Select Yes or No, or leave this optional field unselected.';
  }
  ['description', ...(values.sendNote === 'yes' ? ['notes'] : [])].forEach(field => {
    if (typeof values[field] !== 'string' || values[field].length > 2000) {
      errors[field] = 'Use no more than 2000 characters.';
    }
  });
  if (values.sendNote === 'yes' && (typeof values.notes !== 'string' || !values.notes.trim())) {
    errors.notes = 'Enter a note, or select No.';
  }
  if (values.confirmed !== true) errors.confirmed = 'Confirm the equipment you are updating.';
  return errors;
}

// Do not collapse a persisted false into an unspecified replacement choice.
export function replacementHistoryLabel(value) {
  if (value === false || value === 'no') return 'No';
  if (value === true || value === 'yes') return 'Yes';
  if (value === '') return 'Not specified';
  if (value == null) return 'Not recorded';
  return 'Unrecognized value';
}

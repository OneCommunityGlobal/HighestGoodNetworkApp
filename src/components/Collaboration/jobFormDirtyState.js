export function hasUnsavedJobFormChanges({
  formFields,
  initialFormFields,
  newField,
  initialNewField,
  templateName,
  jobTitle,
  initialJobTitle,
  newOption = '',
  hasModalChanges = false,
}) {
  return (
    JSON.stringify(formFields) !== JSON.stringify(initialFormFields) ||
    JSON.stringify(newField) !== JSON.stringify(initialNewField) ||
    templateName !== '' ||
    newOption !== '' ||
    hasModalChanges ||
    jobTitle !== initialJobTitle
  );
}

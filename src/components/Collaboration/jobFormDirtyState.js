export function hasUnsavedJobFormChanges({
  formFields,
  initialFormFields,
  newField,
  initialNewField,
  templateName,
  jobTitle,
  initialJobTitle,
}) {
  return (
    JSON.stringify(formFields) !== JSON.stringify(initialFormFields) ||
    JSON.stringify(newField) !== JSON.stringify(initialNewField) ||
    templateName !== '' ||
    jobTitle !== initialJobTitle
  );
}

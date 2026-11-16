const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function questionnaireLabel(form, matchingForms) {
  const id = String(form._id || form.id);
  const suffix = id.slice(-6);
  // Keep the full ID when shortened IDs would make two choices indistinguishable.
  const duplicateSuffix = matchingForms.some(
    other => String(other._id || other.id) !== id && String(other._id || other.id).endsWith(suffix),
  );
  const date = form.updatedAt ? new Date(form.updatedAt) : null;
  const updated =
    date && Number.isFinite(date.getTime()) ? shortDate.format(date) : 'Update date unavailable';
  return `${form.category || 'No category'} — ${updated} — ${duplicateSuffix ? id : suffix}`;
}

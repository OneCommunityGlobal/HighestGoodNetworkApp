// Field definitions and validation for the project budget form. Mirrors the backend checks in
// HGNRest controllers/bmdashboard/projectBudgetController.js so errors show before saving.

export const CATEGORY_FIELDS = [
  { key: 'labor', label: 'Labor' },
  { key: 'materials', label: 'Materials' },
  { key: 'equipment', label: 'Equipment' },
];

export const TYPE_FIELDS = [
  { key: 'plumbing', label: 'Plumbing' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'structural', label: 'Structural' },
  { key: 'mechanical', label: 'Mechanical' },
];

export const BUDGET_EDITOR_ROLES = ['Owner', 'Administrator'];

const SUM_TOLERANCE = 0.01;

const isBlank = value => value === undefined || value === null || String(value).trim() === '';

const toAmount = value => (isBlank(value) ? Number.NaN : Number(value));

const isValidAmount = value => Number.isFinite(value) && value >= 0;

export const sumFields = (values, fields) =>
  fields.reduce((sum, { key }) => {
    const amount = toAmount(values?.[key]);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

export const hasAnyValue = (values, fields) => fields.some(({ key }) => !isBlank(values?.[key]));

// Local YYYY-MM-DD for today (the date input's format)
export const todayInputValue = (now = new Date()) => {
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// The effective date is a calendar day stored as UTC midnight; show it in UTC so it does not
// shift a day back in timezones west of UTC.
export const formatEffectiveDate = value =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export const formatTimestamp = value =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

export const formatAmount = value =>
  Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

export const formatUser = user =>
  user && typeof user === 'object' ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '—';

// Form values from a saved budget (or blank for a new one)
export const toFormValues = budget => {
  const values = { categories: {}, types: {}, effectiveDate: todayInputValue() };
  CATEGORY_FIELDS.forEach(({ key }) => {
    values.categories[key] = budget ? String(budget.categories?.[key] ?? '') : '';
  });
  TYPE_FIELDS.forEach(({ key }) => {
    const amount = budget?.expenditureTypes?.[key];
    values.types[key] = amount === undefined || amount === null ? '' : String(amount);
  });
  if (budget?.effectiveDate) values.effectiveDate = String(budget.effectiveDate).slice(0, 10);
  return values;
};

// Returns { errors } keyed by field (empty when valid) and the request body
export const validateBudget = ({ categories, types, effectiveDate }, includeTypes) => {
  const errors = {};

  CATEGORY_FIELDS.forEach(({ key, label }) => {
    if (!isValidAmount(toAmount(categories[key]))) {
      errors[key] = `${label} must be a number of 0 or more`;
    }
  });
  const total = sumFields(categories, CATEGORY_FIELDS);
  if (Object.keys(errors).length === 0 && total <= 0) {
    errors.total = 'The total budget must be greater than 0';
  }

  const useTypes = includeTypes && hasAnyValue(types, TYPE_FIELDS);
  if (useTypes) {
    TYPE_FIELDS.forEach(({ key, label }) => {
      if (!isValidAmount(toAmount(types[key]))) {
        errors[key] = `${label} must be a number of 0 or more`;
      }
    });
    const typeTotal = sumFields(types, TYPE_FIELDS);
    if (
      !TYPE_FIELDS.some(({ key }) => errors[key]) &&
      Math.abs(typeTotal - total) > SUM_TOLERANCE
    ) {
      errors.types = 'Expenditure types must add up to the category total';
    }
  }

  if (isBlank(effectiveDate)) {
    errors.effectiveDate = 'Effective date is required';
  }

  const body = {
    categories: Object.fromEntries(
      CATEGORY_FIELDS.map(({ key }) => [key, toAmount(categories[key])]),
    ),
    effectiveDate,
  };
  if (useTypes) {
    body.expenditureTypes = Object.fromEntries(
      TYPE_FIELDS.map(({ key }) => [key, toAmount(types[key])]),
    );
  }

  return { errors, body };
};

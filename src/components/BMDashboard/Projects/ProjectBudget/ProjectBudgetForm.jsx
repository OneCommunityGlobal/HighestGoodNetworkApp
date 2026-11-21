import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Alert, Button, Form, FormFeedback, FormGroup, Input, Label, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import { fetchBMProjects } from '~/actions/bmdashboard/projectActions';
import { fetchProjectBudget, saveProjectBudget } from '~/actions/bmdashboard/projectBudgetActions';
import styles from './ProjectBudgetForm.module.css';
import {
  BUDGET_EDITOR_ROLES,
  CATEGORY_FIELDS,
  TYPE_FIELDS,
  formatAmount,
  formatEffectiveDate,
  formatTimestamp,
  formatUser,
  hasAnyValue,
  sumFields,
  toFormValues,
  validateBudget,
} from './projectBudgetUtils';

function AmountField({ id, label, value, error, onChange, required }) {
  return (
    <FormGroup className={styles.field}>
      <Label for={id} className={required ? styles.requiredLabel : ''}>
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0"
        value={value}
        invalid={Boolean(error)}
        onChange={e => onChange(e.target.value)}
      />
      <FormFeedback>{error}</FormFeedback>
    </FormGroup>
  );
}

AmountField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
};

const budgetTotal = budget => sumFields(budget?.categories, CATEGORY_FIELDS);

function CurrentBudget({ budget }) {
  if (!budget) {
    return (
      <p className={styles.emptyState}>
        No budget has been set for this project yet, so the Financials charts show a planned cost of
        0.
      </p>
    );
  }

  return (
    <section className={styles.summary} aria-label="Current budget">
      <div className={styles.summaryTotal}>
        <span>Total planned budget</span>
        <strong>{formatAmount(budgetTotal(budget))}</strong>
      </div>
      <ul className={styles.summaryList}>
        {CATEGORY_FIELDS.map(({ key, label }) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{formatAmount(budget.categories?.[key])}</strong>
          </li>
        ))}
      </ul>
      {hasAnyValue(budget.expenditureTypes, TYPE_FIELDS) && (
        <ul className={styles.summaryList}>
          {TYPE_FIELDS.map(({ key, label }) => (
            <li key={key}>
              <span>{label}</span>
              <strong>{formatAmount(budget.expenditureTypes?.[key])}</strong>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.meta}>
        Effective {formatEffectiveDate(budget.effectiveDate)} · set by {formatUser(budget.setBy)} on{' '}
        {formatTimestamp(budget.updatedAt)}
      </p>
    </section>
  );
}

CurrentBudget.propTypes = { budget: PropTypes.object };

function BudgetHistory({ history, darkMode }) {
  if (!history?.length) return null;

  return (
    <section className={styles.history}>
      <h2 className={styles.sectionTitle}>Earlier budgets</h2>
      <div className={styles.tableWrapper}>
        <Table size="sm" className={darkMode ? styles.tableDark : ''}>
          <thead>
            <tr>
              <th scope="col">Effective</th>
              {CATEGORY_FIELDS.map(({ key, label }) => (
                <th key={key} scope="col">
                  {label}
                </th>
              ))}
              <th scope="col">Total</th>
              <th scope="col">Set by</th>
              <th scope="col">Replaced on</th>
            </tr>
          </thead>
          <tbody>
            {history.map(entry => (
              <tr key={`${entry.setAt}-${entry.effectiveDate}`}>
                <td>{formatEffectiveDate(entry.effectiveDate)}</td>
                {CATEGORY_FIELDS.map(({ key }) => (
                  <td key={key}>{formatAmount(entry.categories?.[key])}</td>
                ))}
                <td>{formatAmount(budgetTotal(entry))}</td>
                <td>{formatUser(entry.setBy)}</td>
                <td>{formatTimestamp(entry.setAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </section>
  );
}

BudgetHistory.propTypes = { history: PropTypes.array, darkMode: PropTypes.bool };

export default function ProjectBudgetForm() {
  const { projectId } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const role = useSelector(state => state.auth?.user?.role);
  const projects = useSelector(state => state.bmProjects) || [];
  const project = projects.find(p => String(p._id) === String(projectId));
  const canEdit = BUDGET_EDITOR_ROLES.includes(role);

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState(() => toFormValues(null));
  const [showTypes, setShowTypes] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projects.length === 0) dispatch(fetchBMProjects());
  }, [dispatch, projects.length]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      const res = await fetchProjectBudget(projectId);
      if (!active) return;
      if (res.status === 200) {
        const saved = res.data?.budget || null;
        setBudget(saved);
        setValues(toFormValues(saved));
        setShowTypes(hasAnyValue(saved?.expenditureTypes, TYPE_FIELDS));
      } else {
        setLoadError(res.data?.message || 'Could not load the budget for this project.');
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [projectId]);

  const updateValue = (group, key) => value => {
    setValues(prev => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    setErrors(prev => ({ ...prev, [key]: undefined, total: undefined, types: undefined }));
  };

  const backToProject = () => history.push(`/bmdashboard/projects/${projectId}`);

  const handleSubmit = async event => {
    event.preventDefault();
    const { errors: nextErrors, body } = validateBudget(values, showTypes);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const res = await saveProjectBudget(projectId, body);
    setSaving(false);

    if (res.status === 200) {
      toast.success(budget ? 'Budget updated' : 'Budget saved');
      backToProject();
    } else {
      toast.error(res.data?.message || 'Failed to save the budget');
    }
  };

  const categoryTotal = sumFields(values.categories, CATEGORY_FIELDS);
  const leftToAllocate = categoryTotal - sumFields(values.types, TYPE_FIELDS);

  return (
    <main className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}>
      <div className={`${styles.card} ${darkMode ? styles.cardDark : ''}`}>
        <h1 className={styles.title}>{budget || !canEdit ? 'Project Budget' : 'Set Budget'}</h1>
        {project && <p className={styles.subtitle}>{project.name}</p>}

        {loading && <p className={styles.emptyState}>Loading budget…</p>}
        {loadError && <Alert color="danger">{loadError}</Alert>}

        {!loading && !loadError && (
          <>
            <CurrentBudget budget={budget} />

            {canEdit ? (
              <Form onSubmit={handleSubmit} noValidate>
                <h2 className={styles.sectionTitle}>{budget ? 'Edit budget' : 'New budget'}</h2>

                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>By category</legend>
                  <div className={styles.grid}>
                    {CATEGORY_FIELDS.map(({ key, label }) => (
                      <AmountField
                        key={key}
                        id={`budget-${key}`}
                        label={label}
                        value={values.categories[key]}
                        error={errors[key]}
                        onChange={updateValue('categories', key)}
                        required
                      />
                    ))}
                  </div>
                  <p className={styles.total}>
                    Total: <strong>{formatAmount(categoryTotal)}</strong>
                  </p>
                  {errors.total && <p className={styles.error}>{errors.total}</p>}
                </fieldset>

                <FormGroup check className={styles.toggle}>
                  <Input
                    id="budget-split-types"
                    type="checkbox"
                    checked={showTypes}
                    onChange={e => setShowTypes(e.target.checked)}
                  />
                  <Label for="budget-split-types" check>
                    Also split by expenditure type (optional)
                  </Label>
                </FormGroup>

                {showTypes && (
                  <fieldset className={styles.fieldset}>
                    <legend className={styles.legend}>By expenditure type</legend>
                    <div className={styles.grid}>
                      {TYPE_FIELDS.map(({ key, label }) => (
                        <AmountField
                          key={key}
                          id={`budget-${key}`}
                          label={label}
                          value={values.types[key]}
                          error={errors[key]}
                          onChange={updateValue('types', key)}
                        />
                      ))}
                    </div>
                    <p className={styles.total}>
                      Left to allocate: <strong>{formatAmount(leftToAllocate)}</strong>
                    </p>
                    {errors.types && <p className={styles.error}>{errors.types}</p>}
                  </fieldset>
                )}

                <FormGroup className={styles.field}>
                  <Label for="budget-effective-date" className={styles.requiredLabel}>
                    Effective date
                  </Label>
                  <Input
                    id="budget-effective-date"
                    type="date"
                    value={values.effectiveDate}
                    invalid={Boolean(errors.effectiveDate)}
                    onChange={e => {
                      const { value } = e.target;
                      setValues(prev => ({ ...prev, effectiveDate: value }));
                      setErrors(prev => ({ ...prev, effectiveDate: undefined }));
                    }}
                  />
                  <FormFeedback>{errors.effectiveDate}</FormFeedback>
                </FormGroup>

                <div className={styles.actions}>
                  <Button type="button" color="secondary" outline onClick={backToProject}>
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save budget'}
                  </Button>
                </div>
              </Form>
            ) : (
              <p className={styles.note}>Only Owners and Administrators can set the budget.</p>
            )}

            <BudgetHistory history={budget?.history} darkMode={darkMode} />
          </>
        )}
      </div>
    </main>
  );
}

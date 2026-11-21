import {
  formatEffectiveDate,
  toFormValues,
  todayInputValue,
  validateBudget,
} from '../projectBudgetUtils';

const values = (categories, types = {}, effectiveDate = '2026-11-01') => ({
  categories,
  types,
  effectiveDate,
});

describe('validateBudget', () => {
  it('builds the request body from valid category amounts', () => {
    const { errors, body } = validateBudget(
      values({ labor: '4000', materials: '3000', equipment: '0' }),
      false,
    );
    expect(errors).toEqual({});
    expect(body).toEqual({
      categories: { labor: 4000, materials: 3000, equipment: 0 },
      effectiveDate: '2026-11-01',
    });
  });

  it('rejects negative and blank amounts, a zero total and a missing date', () => {
    expect(
      validateBudget(values({ labor: '-1', materials: '', equipment: '0' }), false).errors,
    ).toEqual({
      labor: 'Labor must be a number of 0 or more',
      materials: 'Materials must be a number of 0 or more',
    });
    expect(
      validateBudget(values({ labor: '0', materials: '0', equipment: '0' }), false).errors,
    ).toEqual({ total: 'The total budget must be greater than 0' });
    expect(
      validateBudget(values({ labor: '1', materials: '0', equipment: '0' }, {}, ''), false).errors,
    ).toEqual({ effectiveDate: 'Effective date is required' });
  });

  it('ignores the type split when it is turned off or left empty', () => {
    const categories = { labor: '10', materials: '0', equipment: '0' };
    expect(validateBudget(values(categories, { plumbing: '1' }), false).body).not.toHaveProperty(
      'expenditureTypes',
    );
    expect(validateBudget(values(categories, {}), true).body).not.toHaveProperty(
      'expenditureTypes',
    );
  });

  it('checks the type split when used', () => {
    const categories = { labor: '10', materials: '0', equipment: '0' };
    expect(validateBudget(values(categories, { plumbing: '10' }), true).errors).toEqual({
      electrical: 'Electrical must be a number of 0 or more',
      structural: 'Structural must be a number of 0 or more',
      mechanical: 'Mechanical must be a number of 0 or more',
    });
    const types = { plumbing: '5', electrical: '5', structural: '0', mechanical: '0' };
    const { errors, body } = validateBudget(values(categories, types), true);
    expect(errors).toEqual({});
    expect(body.expenditureTypes).toEqual({
      plumbing: 5,
      electrical: 5,
      structural: 0,
      mechanical: 0,
    });
  });
});

describe('toFormValues', () => {
  it('fills the form from a saved budget', () => {
    const form = toFormValues({
      categories: { labor: 4000, materials: 0, equipment: 2000 },
      expenditureTypes: { plumbing: 6000 },
      effectiveDate: '2026-10-15T00:00:00.000Z',
    });
    expect(form.categories).toEqual({ labor: '4000', materials: '0', equipment: '2000' });
    expect(form.types.plumbing).toBe('6000');
    expect(form.types.electrical).toBe('');
    expect(form.effectiveDate).toBe('2026-10-15');
  });

  it('starts blank with today as the effective date', () => {
    const form = toFormValues(null);
    expect(form.categories.labor).toBe('');
    expect(form.effectiveDate).toBe(todayInputValue());
  });
});

describe('formatEffectiveDate', () => {
  it('shows the stored calendar day without shifting it by timezone', () => {
    expect(formatEffectiveDate('2026-11-01T00:00:00.000Z')).toBe('Nov 1, 2026');
  });
});

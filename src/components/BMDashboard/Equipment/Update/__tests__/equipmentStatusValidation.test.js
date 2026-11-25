import {
  validateEquipmentStatus,
  equipmentIdentityError,
  replacementHistoryLabel,
} from '../equipmentStatusValidation';
const valid = {
  status: 'Good',
  lastUsedBy: 'Alex',
  lastUsedFor: 'Work',
  replacementRequired: false,
  description: '',
  notes: '',
  sendNote: '',
  confirmed: true,
};
describe('equipment status validation', () => {
  it.each(['Good', 'Needs Repair', 'Out of Order'])('accepts %s', status => {
    expect(validateEquipmentStatus({ ...valid, status })).toEqual({});
  });
  it.each(['', 'Working well', 'Stolen/Lost', ' Good ', null, {}, ['Good']])(
    'rejects invalid condition %j',
    status => {
      expect(validateEquipmentStatus({ ...valid, status })).toHaveProperty('status');
    },
  );
  it.each(['yes', 'no', true, false, ''])(
    'preserves accepted optional replacement value %j',
    replacementRequired => {
      expect(validateEquipmentStatus({ ...valid, replacementRequired })).toEqual({});
    },
  );
  it.each([
    ['lastUsedBy', 200],
    ['lastUsedFor', 500],
    ['description', 2000],
    ['notes', 2000],
  ])('enforces %s length boundaries', (field, limit) => {
    expect(
      validateEquipmentStatus({
        ...valid,
        sendNote: field === 'notes' ? 'yes' : '',
        [field]: 'x'.repeat(limit),
      }),
    ).toEqual({});
    expect(
      validateEquipmentStatus({
        ...valid,
        sendNote: field === 'notes' ? 'yes' : '',
        [field]: 'x'.repeat(limit + 1),
      }),
    ).toHaveProperty(field);
  });
  it('rejects invalid replacement and whitespace-only Other values', () => {
    const result = validateEquipmentStatus({
      ...valid,
      replacementRequired: 'maybe',
      lastUsedBy: 'other',
      lastUsedByOther: ' ',
      lastUsedFor: 'other',
      lastUsedForOther: ' ',
    });
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining(['replacementRequired', 'lastUsedByOther', 'lastUsedForOther']),
    );
  });
  it('requires explicit boolean confirmation', () => {
    expect(validateEquipmentStatus({ ...valid, confirmed: 'true' })).toHaveProperty('confirmed');
  });
  it('rejects malformed metadata', () => {
    expect(equipmentIdentityError([], '0123456789abcdef01234567')).toMatch(/missing or invalid/);
  });
});

describe('backend discriminator and replacement contracts', () => {
  const id = '0123456789abcdef01234567';
  it('accepts only the actual Equipment discriminator when present', () => {
    expect(equipmentIdentityError({ _id: id, __t: 'equipment_item' }, id)).toBe('');
    expect(equipmentIdentityError({ _id: id, __t: 'tool_item' }, id)).toMatch(/Equipment only/);
    expect(equipmentIdentityError({ _id: id, __t: 'Equipment' }, id)).toMatch(/Equipment only/);
  });
  it('does not reinterpret an invalid historical replacement value', () => {
    expect(replacementHistoryLabel('maybe')).toBe('Unrecognized value');
  });
});

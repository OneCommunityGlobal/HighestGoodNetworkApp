import { describe, it, expect } from 'vitest';
import { canEditLesson } from './lessonEditPermissions';

describe('lesson edit permissions', () => {
  it.each(['Owner', 'Administrator', 'Admin', 'Manager', 'Mentor', 'Volunteer', 'Core Team'])(
    'allows %s to edit their own lesson and restricts other authors',
    role => {
      const user = { userid: 'author1', role };
      expect(canEditLesson({ author: { id: 'author1' } }, user)).toBe(true);
      expect(canEditLesson({ author: 'author1' }, user)).toBe(true);
      expect(canEditLesson({ author: { _id: 'author1' } }, user)).toBe(true);
      expect(canEditLesson({ author: 'other' }, user)).toBe(
        ['Owner', 'Administrator', 'Admin'].includes(role),
      );
    },
  );
  it('denies missing identity and missing author for ordinary users', () => {
    expect(canEditLesson({ author: 'author1' }, undefined)).toBe(false);
    expect(canEditLesson({}, { userid: 'author1', role: 'Volunteer' })).toBe(false);
  });
});

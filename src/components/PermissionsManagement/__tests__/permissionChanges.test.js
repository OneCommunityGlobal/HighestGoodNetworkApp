import {
  hasPermissionListChanged,
  hasUserPermissionChanges,
  listPermissionChanges,
} from '../permissionChanges';

describe('hasPermissionListChanged', () => {
  it('ignores order', () => {
    expect(hasPermissionListChanged(['postRole', 'putRole'], ['putRole', 'postRole'])).toBe(false);
  });

  it('ignores duplicates', () => {
    expect(hasPermissionListChanged(['postRole'], ['postRole', 'postRole'])).toBe(false);
    expect(
      hasPermissionListChanged(['postRole', 'postRole', 'putRole'], ['putRole', 'postRole']),
    ).toBe(false);
  });

  it('treats undefined and null as an empty list', () => {
    expect(hasPermissionListChanged(undefined, [])).toBe(false);
    expect(hasPermissionListChanged([], null)).toBe(false);
    expect(hasPermissionListChanged(undefined, undefined)).toBe(false);
    expect(hasPermissionListChanged(undefined, ['postRole'])).toBe(true);
  });

  it('reports an added permission', () => {
    expect(hasPermissionListChanged(['postRole'], ['postRole', 'putRole'])).toBe(true);
  });

  it('reports a removed permission', () => {
    expect(hasPermissionListChanged(['postRole', 'putRole'], ['postRole'])).toBe(true);
    expect(hasPermissionListChanged(['postRole'], [])).toBe(true);
  });

  it('reports no change after adding and then removing the same permission', () => {
    const saved = ['postRole'];
    const added = [...saved, 'putRole'];
    const removedAgain = added.filter(permission => permission !== 'putRole');
    expect(hasPermissionListChanged(saved, added)).toBe(true);
    expect(hasPermissionListChanged(saved, removedAgain)).toBe(false);
  });

  it('reports a swap (same size, different permission)', () => {
    expect(hasPermissionListChanged(['postRole', 'putRole'], ['postRole', 'deleteRole'])).toBe(
      true,
    );
  });

  it('does not change the lists it is given', () => {
    const saved = ['putRole', 'postRole'];
    const draft = ['postRole', 'putRole', 'putRole'];
    hasPermissionListChanged(saved, draft);
    expect(saved).toEqual(['putRole', 'postRole']);
    expect(draft).toEqual(['postRole', 'putRole', 'putRole']);
  });
});

describe('hasUserPermissionChanges', () => {
  const saved = { savedFront: ['postRole'], savedRemoved: ['seeBadges'] };

  it('is false when both lists match the saved ones', () => {
    expect(
      hasUserPermissionChanges({ ...saved, draftFront: ['postRole'], draftRemoved: ['seeBadges'] }),
    ).toBe(false);
  });

  it('is true when only the extra (front) permissions changed', () => {
    expect(
      hasUserPermissionChanges({
        ...saved,
        draftFront: ['postRole', 'putRole'],
        draftRemoved: ['seeBadges'],
      }),
    ).toBe(true);
  });

  it('is true when only the removed default permissions changed', () => {
    expect(hasUserPermissionChanges({ ...saved, draftFront: ['postRole'], draftRemoved: [] })).toBe(
      true,
    );
  });

  it('is false for a user with nothing saved yet and empty lists on screen', () => {
    expect(
      hasUserPermissionChanges({
        savedFront: undefined,
        draftFront: undefined,
        savedRemoved: undefined,
        draftRemoved: [],
      }),
    ).toBe(false);
  });

  it('treats Reset to Default (both lists emptied) as a change only if something was saved', () => {
    expect(hasUserPermissionChanges({ ...saved, draftFront: [], draftRemoved: [] })).toBe(true);
    expect(
      hasUserPermissionChanges({
        savedFront: [],
        savedRemoved: [],
        draftFront: [],
        draftRemoved: [],
      }),
    ).toBe(false);
  });
});

describe('listPermissionChanges', () => {
  const noChanges = { added: [], removed: [] };

  it('lists a permission that is on screen but not saved as added', () => {
    expect(listPermissionChanges(['postRole'], ['postRole', 'putRole'])).toEqual({
      added: ['putRole'],
      removed: [],
    });
  });

  it('lists a saved permission that is no longer on screen as removed', () => {
    expect(listPermissionChanges(['postRole', 'putRole'], ['postRole'])).toEqual({
      added: [],
      removed: ['putRole'],
    });
  });

  it('lists both sides of a swap', () => {
    expect(listPermissionChanges(['postRole', 'putRole'], ['postRole', 'deleteRole'])).toEqual({
      added: ['deleteRole'],
      removed: ['putRole'],
    });
  });

  it('lists nothing after adding and then removing the same permission', () => {
    const saved = ['postRole'];
    const added = [...saved, 'putRole'];
    const removedAgain = added.filter(permission => permission !== 'putRole');
    expect(listPermissionChanges(saved, added)).toEqual({ added: ['putRole'], removed: [] });
    expect(listPermissionChanges(saved, removedAgain)).toEqual(noChanges);
  });

  it('ignores order', () => {
    expect(listPermissionChanges(['postRole', 'putRole'], ['putRole', 'postRole'])).toEqual(
      noChanges,
    );
  });

  it('lists a permission once, even when a list has it twice', () => {
    expect(listPermissionChanges(['seeBadges', 'seeBadges'], ['postRole', 'postRole'])).toEqual({
      added: ['postRole'],
      removed: ['seeBadges'],
    });
  });

  it('treats undefined and null as an empty list', () => {
    expect(listPermissionChanges(undefined, null)).toEqual(noChanges);
    expect(listPermissionChanges(null, ['postRole'])).toEqual({ added: ['postRole'], removed: [] });
    expect(listPermissionChanges(['postRole'], undefined)).toEqual({
      added: [],
      removed: ['postRole'],
    });
  });

  it('does not change the lists it is given', () => {
    const saved = ['putRole', 'postRole'];
    const draft = ['postRole', 'deleteRole', 'deleteRole'];
    listPermissionChanges(saved, draft);
    expect(saved).toEqual(['putRole', 'postRole']);
    expect(draft).toEqual(['postRole', 'deleteRole', 'deleteRole']);
  });
});

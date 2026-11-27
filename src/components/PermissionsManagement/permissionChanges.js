/**
 * Tells whether the permission lists on screen differ from the saved ones.
 *
 * Lists are compared as sets: order and duplicates are ignored, and a missing list
 * (undefined or null) counts as an empty list. The user pop-up works out "unsaved changes"
 * with these helpers on every render and keeps the shared flag in step with the result.
 */
export function hasPermissionListChanged(saved, draft) {
  const savedSet = new Set(saved || []);
  const draftSet = new Set(draft || []);
  if (savedSet.size !== draftSet.size) return true;
  return [...draftSet].some(permission => !savedSet.has(permission));
}

export function hasUserPermissionChanges({ savedFront, draftFront, savedRemoved, draftRemoved }) {
  return (
    hasPermissionListChanged(savedFront, draftFront) ||
    hasPermissionListChanged(savedRemoved, draftRemoved)
  );
}

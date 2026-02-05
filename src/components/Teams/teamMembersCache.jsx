const pending = new Map(); // teamId -> Promise
const resolved = new Map(); // teamId -> members[]

export function fetchTeamMembersCached(dispatch, thunk, teamId) {
  if (!teamId) return Promise.resolve([]);
  if (resolved.has(teamId)) return Promise.resolve(resolved.get(teamId));
  if (pending.has(teamId)) return pending.get(teamId);

  const p = dispatch(thunk(teamId))
    .then(data => {
      const arr = Array.isArray(data) ? data : data?.teamMembers ?? [];
      resolved.set(teamId, arr); // store even []
      pending.delete(teamId);
      return arr;
    })
    .catch(err => {
      pending.delete(teamId);
      throw err;
    });

  pending.set(teamId, p);
  return p;
}

export function getCachedTeamMembers(teamId) {
  return resolved.get(teamId);
}

export function isTeamMembersResolved(teamId) {
  return resolved.has(teamId);
}

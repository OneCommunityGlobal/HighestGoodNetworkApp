import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

// Request-only counterpart to the individual Redux action: no form resets or toasts.
export const assignStudentAtoms = async (studentId, atomTypes, note) => {
  const response = await httpService.post(
    ENDPOINTS.EDUCATOR_ASSIGN_ATOMS(),
    { studentId, atomTypes, note },
    { skipGlobalErrorToast: true },
  );
  return response.data;
};

export const classifyAssignmentError = (error, atomIds) => {
  const data = error.response?.data;
  if (
    error.response?.status === 400 &&
    data?.error === 'All atoms are already assigned to this student' &&
    atomIds.every(id => data.alreadyAssignedAtomIds?.includes(id))
  )
    return 'already assigned';
  // These responses occur before insertion. Other errors can follow partial writes.
  if ([401, 403, 404].includes(error.response?.status)) return 'failed';
  return 'unconfirmed';
};

function getAssignmentStatus(existing, created) {
  if (existing) return 'already assigned';
  return created ? 'assigned' : 'unconfirmed';
}

function getStudentStatus(statuses) {
  if (statuses.has('unconfirmed')) return 'unconfirmed';
  if (statuses.has('failed')) return 'failed';
  if (statuses.has('assigned')) return 'assigned';
  if (statuses.has('previously assigned')) return 'previously assigned';
  return 'already assigned';
}

// Keep confirmed outcomes for the current recovery flow and uncertain outcomes across
// cancellation. Only definite pre-write failures are eligible for explicit retry.
export const assignGroupAtoms = async (studentIds, atomIds, note, ledger) => {
  const results = [];
  await [...new Set(studentIds)].reduce(async (previous, studentId) => {
    await previous;
    const ids = [...new Set(atomIds)];
    const key = id => JSON.stringify([studentId, id]);
    const remaining = ids.filter(id => !ledger.has(key(id)) || ledger.get(key(id)) === 'failed');
    if (remaining.length) {
      remaining.forEach(id => ledger.set(key(id), 'unconfirmed'));
      try {
        const data = await assignStudentAtoms(studentId, remaining, note);
        remaining.forEach(id => {
          const existing = data.alreadyAssignedAtomIds?.includes(id);
          const created = data.successfulAssignments?.some(
            item => String(item.atomId?._id || item.atomId) === id,
          );
          ledger.set(key(id), getAssignmentStatus(existing, created));
        });
      } catch (error) {
        const status = classifyAssignmentError(error, remaining);
        remaining.forEach(id => ledger.set(key(id), status));
      }
    }
    const statuses = new Set(
      ids.map(id => {
        const status = ledger.get(key(id));
        return status === 'assigned' && !remaining.includes(id) ? 'previously assigned' : status;
      }),
    );
    const status = getStudentStatus(statuses);
    results.push({ studentId, status });
  }, Promise.resolve());
  return results;
};

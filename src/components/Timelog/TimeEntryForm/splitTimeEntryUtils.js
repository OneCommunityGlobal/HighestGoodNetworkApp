export const splitDraftKey = personId => `hgn:split-timer:${personId}`;

export function readSplitDraft(personId) {
  try {
    const draft = JSON.parse(localStorage.getItem(splitDraftKey(personId)) || 'null');
    const validRows =
      Array.isArray(draft?.rows) &&
      draft.rows.length >= 2 &&
      draft.rows.length <= 20 &&
      draft.rows.every(
        row =>
          row &&
          ['id', 'taskId', 'hours', 'minutes', 'notes'].every(key => typeof row[key] === 'string'),
      );
    const validPayload =
      draft?.payload?.personId === personId &&
      typeof draft.payload.batchId === 'string' &&
      typeof draft.payload.dateOfWork === 'string' &&
      Number.isSafeInteger(draft.payload.totalMinutes) &&
      draft.payload.totalMinutes > 0;
    return validPayload && validRows ? draft : null;
  } catch {
    return null;
  }
}

export function allocationMinutes(row) {
  if (!/^\d+$/.test(String(row.hours)) || !/^\d+$/.test(String(row.minutes))) return Number.NaN;
  const hours = Number(row.hours);
  const minutes = Number(row.minutes);
  return hours <= 1000 && minutes <= 59 ? hours * 60 + minutes : Number.NaN;
}

export const formatSplitMinutes = total =>
  `${Math.floor(Math.abs(total) / 60)}:${String(Math.abs(total) % 60).padStart(2, '0')}`;

export function splitValidation(rows, totalMinutes, taskIds) {
  const selected = rows.map(row => row.taskId);
  if (rows.length < 2 || rows.length > 20) return 'Choose between 2 and 20 assigned tasks.';
  if (selected.some(id => !taskIds.includes(id))) return 'Choose an assigned task for every row.';
  if (new Set(selected).size !== selected.length) return 'Each task may appear only once.';
  if (
    rows.some(row => !Number.isSafeInteger(allocationMinutes(row)) || allocationMinutes(row) <= 0)
  )
    return 'Give each task a positive time using whole hours and minutes (0–59).';
  if (
    rows.some(
      row =>
        row.notes
          .trim()
          .split(/\s+/)
          .filter(Boolean).length < 10 || !/https:\/\/[a-z\d.-]+\.[a-z]{2,}/i.test(row.notes),
    )
  )
    return 'Each task needs at least 10 words describing the work and an https reference link.';
  if (rows.reduce((sum, row) => sum + allocationMinutes(row), 0) !== totalMinutes)
    return 'Allocated time must equal the session total.';
  return '';
}

/** Detect file-upload prompts without treating "document" used as a verb as an upload. */
export function isJobApplicationFileUploadQuestion(question) {
  const label = String(question?.label || question?.questionText || '').toLowerCase();

  if (/\b(resume|résumé|curriculum\s*vitae|cv)\b/.test(label)) return false;

  const questionType = String(question?.questionType || question?.type || '').toLowerCase();
  if (['file', 'upload', 'document', 'attachment'].includes(questionType)) return true;

  if (/\b(work\s*sample|portfolio|writing\s*sample)\b/.test(label)) return false;
  if (/\b(upload|attach|file)\b/.test(label)) return true;

  return (
    /^documents?\b(?:\s*(?:\([^)]*\)|[-–—:;,.!*]))*\s*$/.test(label.trim()) ||
    /\b(first|second|third|additional|supporting|supplemental|other|required|optional)\s+documents?\b(?:\s*(?:\([^)]*\)|[-–—:;,.!*]))*\s*$/.test(
      label.trim(),
    )
  );
}

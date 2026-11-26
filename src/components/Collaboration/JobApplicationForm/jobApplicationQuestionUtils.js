/** Per-file upload cap; must match the server limit on POST /jobforms/:formId/responses. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Returns a readable error for a file over the upload cap, or '' when it is fine. */
export function getUploadSizeError(file) {
  if (file && file.size > MAX_UPLOAD_BYTES) return 'File too large, max 5 MB.';
  return '';
}

/** Resume/CV prompts are handled by the dedicated resume upload, not the question list. */
export function isResumeQuestion(question) {
  const label = String(question?.label || question?.questionText || '').toLowerCase();
  // Unicode-aware word boundaries: `\b` is ASCII-only, so it never matched "résumé".
  return /(^|[^\p{L}\p{N}_])(resume|résumé|curriculum\s*vitae|cv)(?=$|[^\p{L}\p{N}_])/u.test(label);
}

/** Detect file-upload prompts without treating "document" used as a verb as an upload. */
export function isJobApplicationFileUploadQuestion(question) {
  const label = String(question?.label || question?.questionText || '').toLowerCase();

  if (isResumeQuestion(question)) return false;

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

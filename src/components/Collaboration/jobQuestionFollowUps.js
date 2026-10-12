export function questionPrompt(question) {
  return String(question?.label || question?.questionText || '').toLowerCase();
}

export function isDegreeMajorQuestion(question) {
  const text = questionPrompt(question);
  return text.includes('degree') && text.includes('major');
}

export function isTechnologyExperienceQuestion(question) {
  const text = questionPrompt(question);
  return (
    text.includes('technolog') &&
    (text.includes('experience') || text.includes('full-time') || text.includes('full time'))
  );
}

export function selectedTechnologyNames(answer) {
  if (Array.isArray(answer)) return answer.filter(Boolean).map(String);
  if (answer == null || answer === '') return [];
  return [String(answer)];
}

export function syncTechnologyDetails(previousDetails, selectedNames) {
  const next = {};
  selectedNames.forEach(name => {
    next[name] = previousDetails?.[name] || { fullTime: false, years: '' };
  });
  return next;
}

export function serializeTechnologyAnswer(answer, details) {
  return selectedTechnologyNames(answer).map(technology => ({
    technology,
    fullTime: Boolean(details?.[technology]?.fullTime),
    years: details?.[technology]?.years ?? '',
  }));
}

export function missingTechnologyYearMessages(answer, details) {
  return selectedTechnologyNames(answer)
    .filter(name => {
      const years = String(details?.[name]?.years ?? '').trim();
      return years === '' || Number.isNaN(Number(years)) || Number(years) < 0;
    })
    .map(name => `Years of experience for ${name}`);
}

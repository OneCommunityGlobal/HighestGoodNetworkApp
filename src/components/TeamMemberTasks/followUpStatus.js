// Rules for the follow-up checkbox on Dashboard > Tasks (see FollowUpInfoModal for the text shown to users).
export const FOLLOW_UP_THRESHOLDS = [50, 75, 90];

export function getTaskProgress(hoursLogged, estimatedHours) {
  const logged = Number(hoursLogged) || 0;
  const estimated = Number(estimatedHours) || 0;
  if (estimated <= 0) {
    return logged > 0 ? 100 : 0;
  }
  return Number(((logged / estimated) * 100).toFixed(2));
}

// How many thresholds the progress has passed: 0 (up to 50%), 1, 2 or 3 (over 90%).
export function getFollowUpStage(progress) {
  return FOLLOW_UP_THRESHOLDS.filter(threshold => progress > threshold).length;
}

// A follow-up made exactly at a threshold counts for that threshold (checked at 50% holds until 75%).
function getCheckedStage(checkedAt) {
  return FOLLOW_UP_THRESHOLDS.filter(threshold => checkedAt >= threshold).length;
}

export function needsFollowUp(progress, followUp) {
  if (getFollowUpStage(progress) === 0) {
    return false;
  }
  if (!followUp?.followUpCheck) {
    return true;
  }

  const checkedAt = Number(followUp.followUpPercentageDeadline) || 0;
  const checkedStage = getCheckedStage(checkedAt);
  if (getFollowUpStage(progress) > checkedStage) {
    return true;
  }
  // After the last threshold there is no next stage, so any more time logged needs a new follow-up.
  return checkedStage === FOLLOW_UP_THRESHOLDS.length && progress > checkedAt;
}

export function getFollowUpUpdate(progress, isChecked, needFollowUp) {
  const willBeChecked = needFollowUp || !isChecked;
  return {
    followUpCheck: willBeChecked,
    followUpPercentageDeadline: progress,
    acceptedPercentage: willBeChecked ? progress : 0,
  };
}

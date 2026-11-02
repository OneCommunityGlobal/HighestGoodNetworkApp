import { inRange } from 'lodash';

// For progress bar that shows the percentage of the completion
// Set 'invert' to true when used for the bars of TASK
export const getProgressColor = (effort, commit, invert = false) => {
  let color = 'white';

  const e = Number(effort);
  const c = Number(commit);

  if (!Number.isFinite(e) || !Number.isFinite(c) || c <= 0) {
    return invert ? 'danger' : color;
  }

  if (!invert) {
    const percentage = Math.round((e * 100) / c);

    if (inRange(percentage, 0, 20)) color = 'danger'; // red
    if (inRange(percentage, 20, 40)) color = 'orange'; // orange
    if (inRange(percentage, 40, 60)) color = 'success'; // green
    if (inRange(percentage, 60, 80)) color = 'primary'; // blue
    if (inRange(percentage, 80, 100)) color = 'super'; // indigo
    if (percentage >= 100) color = 'super-awesome'; // purple

    return color;
  }

  const remainingHours = c - e;
  const overHours = e - c;

  // Requirement:
  // Progress bar color for tasks is based on how many deadline hours remain.
  // 0-4.9999 hrs: Red
  // 5-9.9999 hrs: Orange
  // 10-19.9999 hrs: Green
  // 20-29.9999 hrs: Blue
  // 30-39.9999 hrs: Indigo
  // 40-49.9999 hrs: Violet
  // 50+ hrs: Purple
  // If over deadline, bar remains red.
  if (overHours > 0 || remainingHours < 5) return 'danger'; // red
  if (remainingHours < 10) return 'orange'; // orange
  if (remainingHours < 20) return 'success'; // green
  if (remainingHours < 30) return 'primary'; // blue
  if (remainingHours < 40) return 'super'; // indigo
  if (remainingHours < 50) return 'awesome'; // violet
  return 'super-awesome'; // purple
};

// For (progress) bar that is designed for the exact hours in LEADERBOARD
export const getcolor = effort => {
  const hours = Number(effort);

  if (!Number.isFinite(hours)) return 'danger';

  if (hours < 5) return 'danger'; // red
  if (hours < 10) return 'orange'; // orange
  if (hours < 20) return 'success'; // green
  if (hours < 30) return 'primary'; // blue
  if (hours < 40) return 'super'; // indigo
  if (hours < 50) return 'awesome'; // violet
  return 'super-awesome'; // purple
};

// For progress bar that shows the percentage of the completion
export const getProgressValue = (effort, commit) => {
  const e = Number(effort);
  const c = Number(commit);

  if (!(c > 0) || !Number.isFinite(e)) return 0;

  // Keep the task progress bar full once the task has reached/exceeded deadline hours.
  return Math.min(100, Math.max(0, Math.round((e * 100) / c)));
};

// For (progress) bar that is designed for the exact hours in LEADERBOARD
export const getprogress = effort => {
  const hours = Number(effort);

  if (!Number.isFinite(hours) || hours <= 0) return 5;

  if (hours < 5) return 5 + Math.round(5 * (hours / 5));
  if (hours < 10) return 12 + Math.round(5 * ((hours - 5) / 5));
  if (hours < 20) return 20 + Math.round(20 * ((hours - 10) / 10));
  if (hours < 30) return 45 + Math.round(10 * ((hours - 20) / 10));
  if (hours < 40) return 60 + Math.round(15 * ((hours - 30) / 10));
  if (hours < 50) return 80 + Math.round(10 * ((hours - 40) / 10));
  if (hours < 60) return 92;
  if (hours < 70) return 95;
  return 98;
};
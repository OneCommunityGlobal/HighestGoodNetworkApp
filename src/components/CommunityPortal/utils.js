export function isTomorrow(dateString) {
  const input = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return input >= tomorrow && input < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
}

export function isComingWeekend(dateString) {
  const input = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);
  return input >= saturday && input <= sunday;
}

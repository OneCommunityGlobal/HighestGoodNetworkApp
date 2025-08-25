export async function quotePrice({ nightly, taxRate, fees, checkIn, checkOut }) {
  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nightly * nights;
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + tax + fees).toFixed(2);
  return { nights, subtotal, tax, fees, total };
}

export async function checkAvailability({ checkIn, checkOut }) {
  if (!checkIn || !checkOut) return { ok: false, reason: 'Select both dates.' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate <= today) {
    return { ok: false, reason: 'Check-in must be after today.' };
  }

  if (checkInDate >= new Date(checkOut)) {
    return { ok: false, reason: 'Check-out must be after check-in.' };
  }

  for (const d of eachDay(checkIn, checkOut)) {
    if (UNAVAILABLE.has(d)) {
      return { ok: false, reason: `Date ${d} is unavailable.` };
    }
  }

  return { ok: true };
}

export function toISO(d) {
  const x = new Date(d);
  if (Number.isNaN(x)) return '';
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const start = new Date(a);
  const end = new Date(b);
  const ms = end - start;
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86400000);
}

export function eachDay(a, b) {
  const days = [];
  let cur = new Date(a);
  const end = new Date(b);
  while (cur < end) {
    days.push(toISO(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

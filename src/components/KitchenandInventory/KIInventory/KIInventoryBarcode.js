export const BARCODE_FORMAT_ERROR = 'Enter a valid 12-digit UPC or 13-digit EAN barcode.';

export function normalizeBarcode(value) {
  if (typeof value !== 'string') return null;

  const digits = value.trim();
  if (!/^[0-9]{12,13}$/.test(digits)) return null;

  const barcode = digits.padStart(13, '0');
  const weightedSum = [...barcode].reduce(
    (sum, digit, index) => sum + Number(digit) * (index % 2 === 0 ? 1 : 3),
    0,
  );

  return weightedSum % 10 === 0 ? barcode : null;
}

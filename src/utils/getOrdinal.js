export default function getOrdinal(n) {
  const ordinal = ['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th';

  return [n, ordinal];
}

/**
 * Cryptographically uniform random integer in [min, max].
 * Uses crypto.getRandomValues for unbiased results.
 */
export function randomInt(min, max) {
  const range = max - min + 1;
  if (range <= 256) {
    const arr = new Uint8Array(1);
    const limit = 256 - (256 % range);
    let r;
    do {
      crypto.getRandomValues(arr);
      r = arr[0];
    } while (r >= limit);
    return min + (r % range);
  }
  const arr = new Uint32Array(1);
  const MAX = 0x100000000;
  const limit = MAX - (MAX % range);
  let r;
  do {
    crypto.getRandomValues(arr);
    r = arr[0];
  } while (r >= limit);
  return min + (r % range);
}

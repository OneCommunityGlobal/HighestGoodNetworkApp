/**
 * Optional Cloudflare Turnstile support for the public job application form.
 * Everything here is inert unless VITE_TURNSTILE_SITE_KEY is set at build time.
 */

export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Site key from the build environment, or '' when Turnstile is not configured. */
export function getTurnstileSiteKey() {
  return String(import.meta.env?.VITE_TURNSTILE_SITE_KEY || '').trim();
}

let scriptPromise = null;

/** Load the Turnstile script once; resolves with window.turnstile. */
export function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile) {
        resolve(window.turnstile);
      } else {
        scriptPromise = null;
        reject(new Error('Turnstile did not initialise'));
      }
    };
    script.onerror = () => {
      scriptPromise = null; // allow a retry on the next mount
      script.remove();
      reject(new Error('Turnstile script failed to load'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** Test helper: forget the cached script promise. */
export function resetTurnstileLoaderForTests() {
  scriptPromise = null;
}

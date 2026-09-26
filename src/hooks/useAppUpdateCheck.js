import { useEffect, useRef, useState } from 'react';

export const VERSION_URL = '/version.json';
export const DEFAULT_CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Detects when a newer version of the app has been deployed since this
 * page was loaded, by comparing the build ID baked into the bundle with
 * the one in /version.json on the server.
 *
 * Checks are cheap and infrequent on purpose: one small request when the
 * tab becomes visible or the window regains focus, and one every
 * intervalMs while the tab is visible. Checking stops once an update is
 * found. Network or parse errors are ignored so the app is never
 * affected if the file is missing (for example on the local dev server).
 *
 * @param {object} [options]
 * @param {string} [options.currentBuildId] ID of the running build.
 * @param {number} [options.intervalMs] Time between background checks.
 * @param {Function} [options.fetchImpl] fetch implementation, for tests.
 * @returns {{ updateAvailable: boolean, latestBuildId: string|null }}
 */
export default function useAppUpdateCheck({
  currentBuildId = import.meta.env.VITE_APP_BUILD_ID,
  intervalMs = DEFAULT_CHECK_INTERVAL_MS,
  fetchImpl,
} = {}) {
  const [latestBuildId, setLatestBuildId] = useState(null);
  const inFlight = useRef(false);

  const updateAvailable = Boolean(latestBuildId);

  useEffect(() => {
    const doFetch = fetchImpl || globalThis.fetch;
    if (!currentBuildId || updateAvailable || typeof doFetch !== 'function') return undefined;

    let cancelled = false;

    const check = async () => {
      if (inFlight.current || document.visibilityState === 'hidden') return;
      inFlight.current = true;
      try {
        const response = await doFetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const { buildId } = await response.json();
        if (!cancelled && buildId && buildId !== currentBuildId) setLatestBuildId(buildId);
      } catch {
        // Ignore: a failed check must never disrupt the app.
      } finally {
        inFlight.current = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };

    const intervalId = setInterval(check, intervalMs);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', check);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', check);
    };
  }, [currentBuildId, intervalMs, fetchImpl, updateAvailable]);

  return { updateAvailable, latestBuildId };
}

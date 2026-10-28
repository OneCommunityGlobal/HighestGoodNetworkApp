/**
 * Build version stamp used by the "refresh needed" notice.
 *
 * Each production build gets an ID: the git commit Netlify is building
 * (COMMIT_REF), or VITE_BUILD_ID when set manually, or a timestamp as a
 * last resort. The ID is baked into the app bundle and also written to
 * build/version.json. A running app compares the two to tell whether a
 * newer version has been deployed since the page was loaded.
 */

export const resolveBuildId = env =>
  env.COMMIT_REF || env.VITE_BUILD_ID || `local-${new Date().toISOString()}`;

export default function buildVersionPlugin(buildId) {
  return {
    name: 'hgn-build-version',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify({ buildId })}\n`,
      });
    },
  };
}

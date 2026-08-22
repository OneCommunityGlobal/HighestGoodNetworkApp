import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Guards the failure mode that repeatedly broke dark mode in this repo: JSX
 * referencing a CSS-module class that the stylesheet does not define. Those
 * resolve to `undefined` and render as the literal string "undefined", so the
 * element silently loses its styling — which is how the announcements Email tab
 * ended up with a `light-mode` class nothing had ever written a rule for.
 *
 * A render test cannot catch this: vitest.config.js sets
 * `css.modules.classNameStrategy: 'non-scoped'`, so `styles.anything` comes back
 * as a truthy string whether or not the class exists. The check has to be static.
 */

const ROOT = path.resolve(__dirname, '../..');

// [component, stylesheet it imports as `styles`]
const PAIRS = [
  ['components/Announcements/index.jsx', 'components/Announcements/Announcements.module.css'],
  [
    'components/CommunityPortal/Attendence/NoshowViz.jsx',
    'components/CommunityPortal/Attendence/NoshowViz.module.css',
  ],
  [
    'components/HGNPRDashboard/PRDashboardTopReviewedPRs.jsx',
    'components/HGNPRDashboard/PRDashboardTopReviewedPRs.module.css',
  ],
  [
    'components/EmailManagement/email-sender/IntegratedEmailSender.jsx',
    'components/EmailManagement/email-sender/IntegratedEmailSender.module.css',
  ],
  ['components/LeaderBoard/Leaderboard.jsx', 'components/LeaderBoard/Leaderboard.module.css'],
  [
    'components/Reports/ViewReportsByDate/ViewReportsByDate.jsx',
    'components/Reports/reportsPage.module.css',
  ],
  ['components/TeamMemberTasks/TeamMemberTask.jsx', 'components/TeamMemberTasks/style.module.css'],
  ['components/TeamMemberTasks/TeamMemberTasks.jsx', 'components/TeamMemberTasks/style.module.css'],
  ...Array.from({ length: 8 }, (_, i) => [
    `components/TSAForm/pages/TSAFormPage${i + 1}.jsx`,
    'components/TSAForm/TSAForm.module.css',
  ]),
];

const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/** Class names the stylesheet defines locally (i.e. not inside :global(...)). */
function definedClasses(css) {
  const withoutGlobals = css.replace(/:global\([^)]*\)/g, '');
  return new Set([...withoutGlobals.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
}

/** Class names the component reads off the `styles` object. */
function referencedClasses(jsx) {
  const dot = [...jsx.matchAll(/\bstyles\.([a-zA-Z][\w-]*)/g)].map(m => m[1]);
  const bracket = [...jsx.matchAll(/\bstyles\[['"]([^'"]+)['"]\]/g)].map(m => m[1]);
  return [...new Set([...dot, ...bracket])];
}

describe('dark-mode CSS modules', () => {
  it.each(PAIRS)('%s only references classes %s defines', (jsxPath, cssPath) => {
    const defined = definedClasses(read(cssPath));
    const missing = referencedClasses(read(jsxPath)).filter(c => !defined.has(c));
    expect(missing).toEqual([]);
  });

  it.each(PAIRS)('%s imports %s with a binding', (jsxPath, cssPath) => {
    const src = read(jsxPath);
    const basename = path.basename(cssPath);
    // A bare `import './x.module.css'` ships the rules hashed while the JSX uses
    // plain strings, so nothing matches. Scoped to the paired stylesheet on
    // purpose: EmailManagementShared.module.css is still imported bare and is
    // still inert, which is a known, separately-tracked problem.
    const bare = new RegExp(`^import\\s+['"][^'"]*${basename.replace('.', '\\.')}['"];?\\s*$`, 'm');
    expect(bare.test(src)).toBe(false);
  });

  it('keeps Dashboard interaction states in component CSS modules', () => {
    const leaderboard = read('components/LeaderBoard/Leaderboard.jsx');
    const leaderboardCss = read('components/LeaderBoard/Leaderboard.module.css');
    const teamMemberTask = read('components/TeamMemberTasks/TeamMemberTask.jsx');
    const teamMemberTaskCss = read('components/TeamMemberTasks/style.module.css');

    expect(leaderboard).toContain("styles['dark-leaderboard-row']");
    expect(leaderboard.match(/styles\['dark-leaderboard-row'\]/g)).toHaveLength(2);
    expect(leaderboardCss).toContain('.dark-leaderboard-row:focus-within');
    expect(teamMemberTask).toContain("styles['dark-task-row']");
    expect(teamMemberTaskCss).toContain('.dark-teammember-row tr:hover > td');
    expect(teamMemberTaskCss).toContain('.dark-task-row:focus-within');
  });
});

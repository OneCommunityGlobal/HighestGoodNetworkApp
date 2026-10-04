import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  COLORS,
  ROLE_COLOR_MAP,
  contrastRatio,
  getContrastTextColor,
} from '../RoleDistributionPieChart';

// Every colour a slice can get: fixed role colours plus the index fallbacks.
const PALETTE = [...Object.values(ROLE_COLOR_MAP), ...COLORS];

describe('Role Distribution slice label contrast', () => {
  it.each(PALETTE)('label on %s meets WCAG 4.5:1', color => {
    expect(contrastRatio(color, getContrastTextColor(color))).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps white text on the Core Team slice', () => {
    expect(getContrastTextColor(ROLE_COLOR_MAP['Core Team'])).toBe('#FFFFFF');
  });

  // Dark mode forces all text white globally, so TotalOrgSummary.module.css has to
  // re-assert the chart's choice. If it forces one colour onto both classes, the
  // per-slice pick above is lost (the regression this test guards against).
  it('dark-mode CSS keeps the chart picks: light class white, dark class black', () => {
    const css = readFileSync(resolve(__dirname, '../../TotalOrgSummary.module.css'), 'utf8');
    const fillFor = cls =>
      css.match(
        new RegExp(
          String.raw`role-distribution-label-${cls}\)\s*tspan\s*\{[^}]*?fill:\s*([^;\s]+)`,
        ),
      )?.[1];
    expect(fillFor('light')).toBe('#fff');
    expect(fillFor('dark')).toBe('#000');
  });
});

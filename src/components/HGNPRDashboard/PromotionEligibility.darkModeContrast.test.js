/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');

// Regression check requested in PR #5546 review: fixing the selector typo on
// `.promo_table_container.dark .process_promo_btn` made it start matching
// the shared dark-mode button rule for the first time, which silently
// dropped both buttons' contrast from 5.17:1 to 3.68:1 (below WCAG AA's
// 4.5:1 floor for 20px/weight-400 text). This reads the real CSS file and
// checks the ratio directly, so a future edit to these colors fails loudly
// instead of shipping a contrast regression again.

const WCAG_AA_NORMAL_TEXT_MIN_CONTRAST = 4.5;

function hexToLinear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * hexToLinear(r) + 0.7152 * hexToLinear(g) + 0.0722 * hexToLinear(b);
}

function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Promotion Eligibility dark-mode button contrast', () => {
  const css = fs.readFileSync(path.join(__dirname, 'PromotionEligibility.module.css'), 'utf8');

  it('keeps the shared .review_btn / .process_promo_btn dark background at or above WCAG AA contrast', () => {
    const ruleMatch = css.match(
      /\.promo_table_container\.dark \.review_btn,\s*\n\.promo_table_container\.dark \.process_promo_btn\s*\{([^}]*)\}/,
    );
    expect(ruleMatch).not.toBeNull();

    const backgroundMatch = ruleMatch[1].match(/background-color:\s*(#[0-9a-fA-F]{6})/);
    expect(backgroundMatch).not.toBeNull();

    const ratio = contrastRatio(backgroundMatch[1], '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_MIN_CONTRAST);
  });
});

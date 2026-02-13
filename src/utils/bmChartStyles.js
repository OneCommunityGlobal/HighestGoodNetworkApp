/**
 * Shared dark-mode style helpers for BM Dashboard charts.
 * Centralises color tokens so every chart stays consistent
 * and SonarQube no longer flags duplicated style objects.
 */

// ── colour tokens ──────────────────────────────────────────
export const DARK = {
  bg: '#1e2736',
  cardBg: '#2c3344',
  border: '#364156',
  text: '#e0e0e0',
  error: '#ff4d4f',
};

export const LIGHT = {
  bg: '#fff',
  border: '#ccc',
  text: '#333',
};

// ── Recharts Tooltip contentStyle / labelStyle / itemStyle ─
export const getTooltipStyles = darkMode => ({
  contentStyle: {
    backgroundColor: darkMode ? DARK.cardBg : LIGHT.bg,
    border: `1px solid ${darkMode ? DARK.border : LIGHT.border}`,
    color: darkMode ? DARK.text : LIGHT.text,
  },
  labelStyle: { color: darkMode ? DARK.text : LIGHT.text },
  itemStyle: { color: darkMode ? DARK.text : LIGHT.text },
});

// ── react-select dark-mode base styles ─────────────────────
// Use the spread operator to merge with component-specific overrides.
const darkModeSelectBase = {
  control: baseStyles => ({
    ...baseStyles,
    backgroundColor: DARK.cardBg,
    borderColor: DARK.border,
  }),
  menu: baseStyles => ({
    ...baseStyles,
    backgroundColor: DARK.cardBg,
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isFocused ? DARK.border : DARK.cardBg,
    color: DARK.text,
  }),
  singleValue: baseStyles => ({
    ...baseStyles,
    color: DARK.text,
  }),
};

/**
 * Returns dark-mode styles for a single-value `<Select>`.
 * Pass `darkMode` boolean – returns `{}` in light mode.
 */
export const getSingleSelectStyles = darkMode => (darkMode ? darkModeSelectBase : {});

/**
 * Returns dark-mode styles for a multi-value `<Select>`.
 * Extends the base styles with multiValue tokens.
 */
export const getMultiSelectStyles = darkMode =>
  darkMode
    ? {
        ...darkModeSelectBase,
        multiValue: baseStyles => ({
          ...baseStyles,
          backgroundColor: DARK.border,
        }),
        multiValueLabel: baseStyles => ({
          ...baseStyles,
          color: DARK.text,
        }),
        multiValueRemove: baseStyles => ({
          ...baseStyles,
          color: DARK.text,
          ':hover': { backgroundColor: DARK.error, color: '#fff' },
        }),
      }
    : {};

// ── Recharts axis / grid helpers ───────────────────────────
export const getAxisTickFill = darkMode => (darkMode ? DARK.text : LIGHT.text);
export const getGridStroke = darkMode => (darkMode ? DARK.border : LIGHT.border);

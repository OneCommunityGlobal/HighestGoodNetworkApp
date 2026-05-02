export const DEFAULT_EMOJI = '🆕';
export const EMOJI_OPTIONS = [
  '🆕',
  '✅',
  '💪',
  '🔒',
  '🔥',
  '🚀',
  '⚡️',
  '🛠️',
  '🎯',
  '🌟',
  '👀',
  '🔄',
  '⏸️',
  '🏁',
  '🦾',
  '🚩',
  '🎁',
  '👓',
  '🌏',
  '🥇',
  '🥈',
  '🥉',
  '🏅',
  '⛺️',
  '⚙️',
  '📦',
  '🖥️',
  '⚠️',
  '‼️',
  '❌',
];

export const COLOR_SWATCHES = [
  { label: 'Blue', hex: '#3498db' },
  { label: 'Green', hex: '#27ae60' },
  { label: 'Purple', hex: '#9b59b6' },
  { label: 'Orange', hex: '#e67e22' },
  { label: 'Red', hex: '#e74c3c' },
  { label: 'Teal', hex: '#16a085' },
  { label: 'Navy', hex: '#2c3e50' },
  { label: 'Pink', hex: '#e91e8c' },
  { label: 'Yellow', hex: '#f1c40f' },
  { label: 'Indigo', hex: '#3f51b5' },
  { label: 'Cyan', hex: '#00bcd4' },
  { label: 'Brown', hex: '#795548' },
  { label: 'Lime', hex: '#8bc34a' },
  { label: 'Deep Purple', hex: '#673ab7' },
  { label: 'Slate', hex: '#607d8b' },
];

export const DEFAULT_COLOR = '#3498db';

export function getStateColor(catalogColor, darkMode) {
  if (catalogColor) return { bg: catalogColor, text: '#fff' };
  return { bg: darkMode ? '#2a3a5c' : '#607d8b', text: '#fff' };
}

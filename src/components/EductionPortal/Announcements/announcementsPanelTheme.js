export const getAnnouncementsPanelTheme = darkMode => ({
  panelBg: darkMode ? '#1b2a41' : 'white',
  borderColor: darkMode ? '#3A506B' : '#e0e0e0',
  textPrimary: darkMode ? '#e2e8f0' : '#333333',
  textMuted: darkMode ? '#94a3b8' : '#666',
  contentBg: darkMode ? '#0d1b2a' : '#f8f9fa',
  inputBg: darkMode ? '#243B5A' : 'white',
  inputBorder: darkMode ? '#3A506B' : '#ccc',
});

export const getSectionBarStyle = theme => ({
  backgroundColor: theme.panelBg,
  borderBottom: `1px solid ${theme.borderColor}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

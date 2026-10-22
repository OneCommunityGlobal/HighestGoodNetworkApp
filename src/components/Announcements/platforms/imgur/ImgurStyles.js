// Styles for Imgur Auto-Poster component

export const tabsStyle = darkMode => ({
  display: 'flex',
  gap: '0.5rem',
  borderBottom: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
  marginBottom: '1.5rem',
});

export const tabButtonStyle = (isActive, darkMode) => {
  const activeColor = darkMode ? '#60a5fa' : '#2563eb';
  const inactiveColor = darkMode ? '#9ca3af' : '#6b7280';
  return {
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'transparent',
    borderBottom: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
    color: isActive ? activeColor : inactiveColor,
    cursor: 'pointer',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  };
};

export const formContainerStyle = darkMode => ({
  padding: '1.5rem',
  borderRadius: '0.5rem',
  backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
});

export const previewContainerStyle = darkMode => ({
  marginTop: '1rem',
  padding: '1rem',
  borderRadius: '0.375rem',
  backgroundColor: darkMode ? '#111827' : '#f3f4f6',
  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
});

export const imagePreviewStyle = {
  maxWidth: '100%',
  maxHeight: '300px',
  borderRadius: '0.375rem',
  objectFit: 'cover',
};

export const scheduledPostsContainerStyle = darkMode => ({
  marginTop: '2rem',
  padding: '1.5rem',
  borderRadius: '0.5rem',
  backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
});

export const scheduledPostItemStyle = darkMode => ({
  padding: '1rem',
  marginBottom: '1rem',
  borderRadius: '0.375rem',
  backgroundColor: darkMode ? '#111827' : '#fff',
  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
});

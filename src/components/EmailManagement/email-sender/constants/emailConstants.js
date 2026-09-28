// emailConstants.js
export const EMAIL_MODES = {
  TEMPLATES: 'Templates',
  CUSTOM: 'Custom',
  WEEKLY_UPDATE: 'Weekly Update',
};

export const EMAIL_DISTRIBUTION = {
  SPECIFIC: 'specific',
  BROADCAST: 'broadcast',
  ALL_USERS: 'all_users',
  SUBSCRIBERS: 'subscribers',
};

export const VARIABLE_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  URL: 'url',
  IMAGE: 'image',
  TEXTAREA: 'textarea',
};

export const YOUTUBE_THUMBNAIL_QUALITIES = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];

// ==================== NEW CONSTANTS - ADD THESE ====================

// UI Colors for consistent styling
export const UI_COLORS = {
  primary: '#007bff',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  secondary: '#6c757d',
  light: '#f8f9fa',
  dark: '#343a40',
};

// Status badge colors
export const STATUS_COLORS = {
  SENT: 'success',
  PENDING: 'warning',
  FAILED: 'danger',
  PROCESSING: 'info',
};

// Email statuses
export const EMAIL_STATUSES = {
  SENT: 'SENT',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  PROCESSING: 'PROCESSING',
};

// Variable type icons
export const VARIABLE_TYPE_ICONS = {
  text: '📝',
  textarea: '📄',
  image: '🖼️',
  number: '#️⃣',
  email: '📧',
  url: '🔗',
  date: '📅',
};

// ARIA labels for accessibility
export const ACCESSIBILITY = {
  ARIA_LABELS: {
    emailMode: 'Email composition mode',
    refresh: 'Refresh email list',
    settings: 'Settings menu',
    autoRefresh: 'Toggle auto-refresh',
    filter: 'Filter emails by status',
    closeModal: 'Close modal',
    viewDetails: 'View email details',
    resendEmail: 'Resend failed email',
  },
};

/**
 * Shared utility functions and constants for Resource Request components
 * Reduces code duplication across multiple components
 */

// Status and Priority color mappings
export const STATUS_COLORS = {
  pending: '#ffc107',
  approved: '#28a745',
  denied: '#dc3545',
};

export const PRIORITY_COLORS = {
  low: '#17a2b8',
  medium: '#007bff',
  high: '#fd7e14',
  urgent: '#dc3545',
};

// Get color for status
export const getStatusColor = status => STATUS_COLORS[status] || '#6c757d';

// Get color for priority
export const getPriorityColor = priority => PRIORITY_COLORS[priority] || '#6c757d';

// Filter requests by status
export const filterByStatus = (requests, status) => {
  if (status === 'all') return requests;
  return requests.filter(req => req.status === status);
};

// Calculate request statistics
export const getRequestStats = requests => ({
  total: requests.length,
  pending: requests.filter(r => r.status === 'pending').length,
  approved: requests.filter(r => r.status === 'approved').length,
  denied: requests.filter(r => r.status === 'denied').length,
});

// Get status badge configuration
export const getStatusBadgeConfig = status => {
  const configs = {
    pending: { color: 'warning', icon: '⏳', label: 'Pending' },
    approved: { color: 'success', icon: '✓', label: 'Approved' },
    denied: { color: 'danger', icon: '✕', label: 'Denied' },
  };
  return configs[status] || configs.pending;
};

// Get priority badge configuration
export const getPriorityBadgeConfig = priority => {
  const configs = {
    low: { color: 'info', bgColor: '#d1ecf1' },
    medium: { color: 'primary', bgColor: '#cfe2ff' },
    high: { color: 'warning', bgColor: '#fff3cd' },
    urgent: { color: 'danger', bgColor: '#f8d7da' },
  };
  return configs[priority] || configs.medium;
};

export default {
  STATUS_COLORS,
  PRIORITY_COLORS,
  getStatusColor,
  getPriorityColor,
  filterByStatus,
  getRequestStats,
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
};

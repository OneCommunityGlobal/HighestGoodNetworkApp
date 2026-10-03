// Layout configuration for the Educator Reports dashboard
export const LAYOUT_CONFIG = {
  // Header height - adjust this value to match your application's header
  HEADER_HEIGHT: '110px', // Increased for better clearance below top nav

  // Sidebar width
  SIDEBAR_WIDTH: '250px',

  // Responsive breakpoints
  MOBILE_BREAKPOINT: '768px',
  TABLET_BREAKPOINT: '992px',

  // Z-index values
  HEADER_Z_INDEX: 1100,
  SIDEBAR_Z_INDEX: 1000,
  MODAL_Z_INDEX: 1200,
};

// CSS custom properties for use in components
export const getCSSVariables = () => ({
  '--header-height': LAYOUT_CONFIG.HEADER_HEIGHT,
  '--sidebar-width': LAYOUT_CONFIG.SIDEBAR_WIDTH,
});

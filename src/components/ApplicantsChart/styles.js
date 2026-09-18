// ApplicantsChart styles as JS objects

export const boxStyle = {
  width: '800px',
  height: '500px',
  margin: '0 auto',
  padding: '20px',
  background: '#1a2540', // dark blue background as in screenshot
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

export const boxStyleDark = {
  ...boxStyle,
  background: '#222e3c', // slightly darker for dark mode
  color: '#fff',
};

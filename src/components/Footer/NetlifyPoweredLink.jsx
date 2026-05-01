import { useSelector } from 'react-redux';

function NetlifyPoweredLink() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <span style={{ color: darkMode ? 'white' : 'black' }}>
      This site is powered by{' '}
      <a
        href="https://www.netlify.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'underline' }}
      >
        Netlify
      </a>
    </span>
  );
}

export default NetlifyPoweredLink;

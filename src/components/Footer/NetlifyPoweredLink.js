function NetlifyPoweredLink() {
  return (
    <span style={{ color: 'black' }}>
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

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <section
      // eslint-disable-next-line react/jsx-curly-brace-presence
      className={`h-100 d-flex   align-items-center  flex-column justify-content-center`}
      style={{ backgroundColor: darkMode ? '#121212' : 'white' }}
    >
      <div
        className=" d-flex   align-items-center justify-content-center "
        style={{
          width: '50%',
          height: '50%',
          backgroundImage: !darkMode
            ? `url("/imagePage404.png")`
            : `url("/imagePage404DarkMode.png")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          marginBottom: '20rem',
        }}
      >
        {validateUserLogin ? (
          <p
            style={{ marginTop: !darkMode ? '25rem' : '20rem', fontSize: '25px' }}
            className={`${darkMode ? 'text-light' : 'text-dark'}`}
          >
            The rabbits have been nibbling the cables again... Maybe this will help &nbsp;
            <Link to="/dashboard">home</Link> or you can report this page by clicking &nbsp;
            <Link to="/dashboard?openModalReport">here</Link>
          </p>
        ) : (
          // eslint-disable-next-line react/jsx-curly-brace-presence
          <p
            style={{ marginTop: !darkMode ? '25rem' : '20rem', fontSize: '25px' }}
            className={`${darkMode ? 'text-light' : 'text-dark'}`}
          >
            It seems like you&apos;ve reached a page that doesn&apos;t exist. In addition
            You&apos;re not currently logged in. Please go back to the &nbsp;
            <Link to="/login">login page</Link>
          </p>
        )}
      </div>
    </section>
  );
}

export default NotFoundPage;

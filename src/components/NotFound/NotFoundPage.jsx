import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './notFoundPage.css';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <section
      // eslint-disable-next-line react/jsx-curly-brace-presence
      // d-flex   align-items-center  flex-column justify-content-center
      className={`h-100 `}
      style={{ backgroundColor: darkMode ? '#121212' : 'white' }}
    >
      <div className="backgroungContainer">
        <div
          className="container "
          style={{
            backgroundColor: darkMode ? '#121212' : 'white',
            marginBottom: '20px',
            border: `1px solid ${darkMode ? 'white' : '#121212'}`,
            borderRadius: '20px',
            width: `${window.innerWidth < 600 ? '95%' : '100'}`,
          }}
        >
          <img
            src={`${darkMode ? '/imagePage404DarkMode.png' : 'imagePage404.png'}`}
            alt="404 error page illustration"
          />
          {validateUserLogin ? (
            <p
              style={{ margin: '0px 20px' }}
              className={`${darkMode ? 'text-light' : 'text-dark '}`}
            >
              The rabbits have been nibbling the cables again... Maybe this will help
              <Link style={{ marginLeft: '6px' }} to="/dashboard">
                home
              </Link>{' '}
              or you can report this page by clicking
              <Link style={{ marginLeft: '6px' }} to="/dashboard?openModalReport">
                here
              </Link>
            </p>
          ) : (
            // eslint-disable-next-line react/jsx-curly-brace-presence
            <p
              style={{ margin: '0px 20px' }}
              className={`${
                darkMode ? 'text-light message-error-404DarkMode ' : 'text-dark  message-error-404'
              }`}
            >
              It seems like you&apos;ve reached a page that doesn&apos;t exist. In addition
              You&apos;re not currently logged in. Please go back to the
              <Link style={{ marginLeft: '8px' }} to="/login">
                login page
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './notFoundPage.css';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <section
      // eslint-disable-next-line react/jsx-curly-brace-presence
      className={`h-100 d-flex   align-items-center  flex-column justify-content-center`}
      style={{ backgroundColor: darkMode ? '#121212' : 'white' }}
    >
      <div className={`${darkMode ? 'containerImageDarkMode' : 'containerImage'}`}>
        <div className={`${!darkMode ? 'image-404' : 'image-404DarkMode'}`}>
          <img
            src={`${darkMode ? '/imagePage404DarkMode.png' : 'imagePage404.png'}`}
            className={`${darkMode ? 'imageDarkMode' : 'image'}`}
            alt="404 error page illustration"
          />
          {validateUserLogin ? (
            <p
              //  28rem
              className={`${
                darkMode ? 'text-light message-error-404DarkMode ' : 'text-dark  message-error-404'
              }`}
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
              style={{ fontSize: '25px' }}
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

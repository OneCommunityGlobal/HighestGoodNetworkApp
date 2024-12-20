import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

      <style>{`
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }

      .backgroungContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }

      .container {
        width: 80%;
        height: auto;
      }

      .container img {
        max-width: 100%;
        width: 100%;
        height: 25rem;
        display: block;
        object-fit: contain;
      }

      .container p {
        font-size: 22px;
        position: relative;
        top: -100px;
        left: 20px;
      }

      @media (max-width: 600px) {
        .container img {
          width: 100%;
          height: 15rem;
          display: block;
          object-fit: cover;
        }
        .container p {
          font-size: 15px;
          position: relative;
          top: -20px;
          left: 20px;
        }
      }

      @media (max-width: 400px) {
        .container img {
          width: 100%;
          height: 15rem;
          display: block;
          object-fit: contain;
        }
      }
    `}</style>
    </section>
  );
}

export default NotFoundPage;

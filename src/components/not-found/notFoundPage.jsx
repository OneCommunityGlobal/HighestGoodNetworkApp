import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <section
      // prettier-ignore
      className={`${darkMode ? 'bg-oxford-blue' : 'bg-white'} h-100 d-flex   align-items-center  flex-column
        ${!validateUserLogin && 'justify-content-center'} `}
    >
      <div>
        <h2 style={{ color: darkMode ? 'white' : 'black', textAlign: 'center' }}>
          {' '}
          404 | Page not found
        </h2>
        <div className={`${darkMode ? 'text-light' : 'text-dark'}`}>
          {validateUserLogin ? (
            <div className="col-12">
              <p>
                It seems like you&apos;ve reached a page that doesn&apos;t exist. Maybe this will
                help &nbsp;
                <Link to="/dashboard">home</Link> or you can report this page by clicking &nbsp;
                <Link to="/dashboard?openModalReport">here</Link>
              </p>
            </div>
          ) : (
            // eslint-disable-next-line react/jsx-curly-brace-presence
            <p className={`col-12`} style={{ marginBottom: !validateUserLogin && '20rem' }}>
              It seems like you&apos;ve reached a page that doesn&apos;t exist. In addition
              You&apos;re not currently logged in. Please go back to the &nbsp;
              <Link to="/login">login page</Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;

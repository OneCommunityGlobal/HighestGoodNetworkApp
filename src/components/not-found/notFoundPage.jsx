import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [validateUserLogin, setValidateUserLogin] = useState(localStorage.getItem('token'));

  useEffect(() => {
    setValidateUserLogin(localStorage.getItem('token'));
  }, []);

  return (
    <div>
      <section
        // prettier-ignore
        className={`${darkMode ? 'bg-oxford-blue' : 'bg-white'} h-100 d-flex   align-items-center  flex-column
        ${!validateUserLogin && 'justify-content-center'} `}
      >
        <div>
          <h2 style={{ color: darkMode ? 'white' : 'black' }}> 404 | Page not found</h2>
          <div className={`${darkMode ? 'text-light' : 'text-dark'}`}>
            {validateUserLogin ? (
              <div className="col-12">
                <p>
                  It seems like you&apos;ve reached a page that doesn&apos;t exist. Maybe this will
                  help?
                  <Link to="/dashboard">home</Link> or you can report this page by clicking
                  <Link to="/dashboard?openModalReport">here</Link>
                </p>
              </div>
            ) : (
              // eslint-disable-next-line react/jsx-curly-brace-presence
              <p className={`col-12`} style={{ marginBottom: !validateUserLogin && '20rem' }}>
                You&apos;re not currently logged in. Please log in to continue.
                <Link to="/login">Go to Login</Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default NotFoundPage;

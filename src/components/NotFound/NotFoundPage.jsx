import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');
  //const

  return (
    <div
      className={cn(styles.notFoundContainer, darkMode ? cn(styles.darkMode, styles.bgBlack) : '')}
    >
      <section
        style={
          darkMode
            ? { border: '2px solid white', borderRadius: '20px' }
            : { border: '2px solid #000000', borderRadius: '20px' }
        }
        className={styles.sectionImage}
      >
        <img
          className={styles.notFoundImage}
          src={darkMode ? NotFoundDarkImage : NotFoundImage}
          alt="Page Not Found"
        />
        <h3 style={darkMode?{color: "white"} : {color: "black"}}>Page not found</h3>

        {validateUserLogin ? (
            <p className={styles.notFoundText}>
              The rabbits have been nibbling the cables again... ... Maybe this will help
              <Link style={{ marginLeft: '6px' }} to="/dashboard">
                home
              </Link>{' '}
              or you can report this page by clicking
              <Link style={{ marginLeft: '6px' }} to="/dashboard?openModalReport">
                here
              </Link>
            </p>
        ) : (
          <p
            style={{ margin: '10px 20px' }}
            className={`${styles.notFoundText}  ${darkMode? "text-light": "text-dark"}`}
          >
            It seems like you&apos;ve reached a page that doesn&apos;t exist. In addition
            You&apos;re not currently logged in. Please go back to the
            <Link style={{ marginLeft: '8px' }} to="/login">
              login page
            </Link>
          </p>
        )}
      </section>

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
    </div>
  );
}

export default NotFoundPage;

import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <div className={cn(styles.notFoundContainer, darkMode ? cn(
      styles.darkMode, styles.bgBlack
    ) : '')}>
      <img
        className={styles.notFoundImage}
        src={darkMode ? NotFoundDarkImage : NotFoundImage}
        alt="Page Not Found"
      />
      <div className={styles.notFoundText}>
        <h1>PAGE NOT FOUND</h1>
        <p>The rabbits have been nibbling the cables again...</p>
        <p>
          Maybe this will help{' '}
          <Link to="/" className={styles.backHomeLink}>
            Home
          </Link>
        </p>
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

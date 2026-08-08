import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import styles from './NotFoundPage.module.css';
import NotFoundImage from '../../assets/images/404Image1.png';
import NotFoundDarkImage from '../../assets/images/404ImageDarkMode1.png';

function NotFoundPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const validateUserLogin = localStorage.getItem('token');

  return (
    <div
      className={cn(styles.notFoundContainer, darkMode ? cn(styles.darkMode, styles.bgBlack) : '')}
    >
      <section
        className={cn(
          styles.sectionImage,
          darkMode ? styles.sectionImageDark : styles.sectionImageLight,
        )}
      >
        <img
          className={styles.notFoundImage}
          src={darkMode ? NotFoundDarkImage : NotFoundImage}
          alt="Page Not Found"
        />
        <h3 className={darkMode ? styles.headingDark : styles.headingLight}>Page not found</h3>

        {validateUserLogin ? (
          <p className={styles.notFoundText}>
            The rabbits have been nibbling the cables again... ... Maybe this will help
            <Link
              className={cn(styles.linkSpacing, darkMode ? styles.linkDark : '')}
              to="/dashboard"
            >
              home
            </Link>{' '}
            or you can report this page by clicking
            <Link
              className={cn(styles.linkSpacing, darkMode ? styles.linkDark : '')}
              to="/dashboard?openModalReport"
            >
              here
            </Link>
          </p>
        ) : (
          <p
            className={cn(
              styles.notFoundText,
              styles.loggedOutText,
              darkMode ? 'text-light' : 'text-dark',
            )}
          >
            It seems like you&apos;ve reached a page that doesn&apos;t exist. In addition
            You&apos;re not currently logged in. Please go back to the
            <Link className={cn(styles.linkSpacingLg, darkMode ? styles.linkDark : '')} to="/login">
              login page
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}

export default NotFoundPage;

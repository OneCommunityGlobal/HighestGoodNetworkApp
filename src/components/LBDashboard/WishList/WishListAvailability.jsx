import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Header from '../Header';
import styles from './WishList.module.css';
import availabilityStyles from './WishListAvailability.module.css';

function WishListAvailability({ wishlistItem, wishlists }) {
  const { id } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);

  const item =
    wishlistItem && String(wishlistItem.id) === String(id)
      ? wishlistItem
      : wishlists.find(w => String(w.id) === String(id));

  return (
    <div className={`${styles.pageRoot} ${darkMode ? styles.pageRootDark : ''}`}>
      <div className={styles.item}>
        <div className={styles.itemContainer}>
          <Header />
          {item ? (
            <div
              className={`${styles.itemBody} ${darkMode ? styles.itemBodyDark : ''} ${
                availabilityStyles.card
              }`}
            >
              <h1 className={styles.listItemTitle}>{item.title}</h1>
              <h2 className={styles.listItemTitle}>{item.unit}</h2>
              <div className={styles.itemPrice}>
                <span className={styles.font600}>{item.price}</span>
              </div>

              <h3 className={availabilityStyles.heading}>Availability</h3>
              <p
                className={`${availabilityStyles.placeholder} ${
                  darkMode ? availabilityStyles.placeholderDark : ''
                }`}
              >
                Availability information coming soon.
              </p>

              <Link to="/lbdashboard/wishlists" className={styles.footerLink}>
                &larr; Back to Wishlists
              </Link>
            </div>
          ) : (
            <div className={availabilityStyles.card}>
              <p className={styles.noResults}>Property not found</p>
              <Link to="/lbdashboard/wishlists" className={styles.footerLink}>
                &larr; Back to Wishlists
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const wishlistEntryShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  unit: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

WishListAvailability.propTypes = {
  wishlistItem: wishlistEntryShape,
  wishlists: PropTypes.arrayOf(wishlistEntryShape),
};

WishListAvailability.defaultProps = { wishlistItem: null, wishlists: [] };

const mapStateToProps = state => ({
  wishlistItem: state.wishlistItem.wishListItem,
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishListAvailability);

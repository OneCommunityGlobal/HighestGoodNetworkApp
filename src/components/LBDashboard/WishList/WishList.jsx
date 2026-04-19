import styles from './WishList.module.css';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { setCurrentWishListItem } from '~/reducers/listBidDashboard/wishListItemReducer';
import Header from '../Header';

function WishList(props) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { wishlists } = props;

  return (
    <div className={`${styles.pageRoot} ${darkMode ? styles.pageRootDark : ''}`}>
      <div className={styles.item}>
        <div className={styles.itemContainer}>
          <Header />

          <div className={`${styles.itemLocation} ${styles.listLocation}`}>
            <FaMapMarkerAlt className={styles.itemIcon} />
            <Link
              to="/lbdashboard/masterplan"
              className={darkMode ? styles.wishlistLinkDark : styles.mapLinkLight}
            >
              View on Property Map
            </Link>
          </div>

          <h1 className={`${styles.listTitle} ${darkMode ? styles.listTitleDark : ''}`}>
            Wish List
          </h1>

          {wishlists?.map(item => {
            const firstImg = item.images?.[0];
            return (
              <div
                className={`${styles.itemBody} ${darkMode ? styles.itemBodyDark : ''}`}
                key={item.id}
              >
                <div className={styles.itemMainRow}>
                  <div className={styles.listDetailsLeft}>
                    <div className={styles.itemTitleWrapperMobile}>
                      <h1 className={`${styles.listItemTitle} ${styles.listItemTitleMobile}`}>
                        {item.title}
                      </h1>
                      <h2 className={`${styles.listItemTitle} ${styles.listItemTitleMobile}`}>
                        {item.unit}
                      </h2>
                    </div>

                    {firstImg ? (
                      <img
                        src={firstImg}
                        alt={`${item.title}, ${item.unit}`}
                        className={styles.itemImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>No image</div>
                    )}
                  </div>

                  <div className={styles.listDetailsRight}>
                    <div className={`${styles.itemTitleWrapper} ${styles.itemTitleWrapperDesktop}`}>
                      <span className={`${styles.listItemTitle} ${styles.itemTitleRight}`}>
                        {item.title}
                      </span>
                    </div>

                    <div className={styles.itemDetails}>
                      <span className={`${styles.listItemTitle} ${styles.itemTitleWrapperDesktop}`}>
                        {item.unit}
                      </span>

                      <div className={styles.listItemAmenities}>
                        <div>
                          <span className={styles.font600}>Available amenities in this unit:</span>
                          <ol>
                            {item.unitAmenities?.map(amenity => (
                              <li key={amenity}>{amenity}</li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <div className={styles.itemPrice}>
                        <span className={styles.font600}>Basic per night price:</span> {item.price}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.itemCardFooter}>
                  <div className={styles.footerLinks}>
                    <Link
                      to={`/lbdashboard/wishlist/${item.id}`}
                      onClick={() => dispatch(setCurrentWishListItem(item))}
                      className={`${styles.footerLink} ${darkMode ? styles.wishlistLinkDark : ''}`}
                    >
                      Click here to view availabilities
                    </Link>
                    <Link
                      to={`/lbdashboard/wishlist/${item.id}`}
                      onClick={() => dispatch(setCurrentWishListItem(item))}
                      className={`${styles.footerLink} ${darkMode ? styles.wishlistLinkDark : ''}`}
                    >
                      Click for list overview
                    </Link>
                  </div>
                  <Link
                    to={`/lbdashboard/messaging?listingId=${encodeURIComponent(item.id)}`}
                    className={`${styles.chatButton} ${darkMode ? styles.chatButtonDark : ''}`}
                  >
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/material-outlined/24/chat.png"
                      alt=""
                      aria-hidden="true"
                    />
                    Chat with the Host
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishList);

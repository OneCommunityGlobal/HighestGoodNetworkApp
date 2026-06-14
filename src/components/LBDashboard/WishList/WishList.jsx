import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { setCurrentWishListItem } from '~/reducers/listBidDashboard/wishListItemReducer';
import Header from '../Header';
import styles from './WishList.module.css';

function WishList({ wishlists }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedVillage, setSelectedVillage] = useState('');

  const villages = useMemo(() => [...new Set(wishlists.map(item => item.title).filter(Boolean))], [
    wishlists,
  ]);

  const filteredWishlists = selectedVillage
    ? wishlists.filter(item => item.title === selectedVillage)
    : wishlists;

  const handleSelectWishlistItem = item => {
    dispatch(setCurrentWishListItem(item));
  };

  return (
    <div className={`${styles.pageRoot} ${darkMode ? styles.pageRootDark : ''}`}>
      <div className={styles.item}>
        <div className={styles.itemContainer}>
          <Header villages={villages} onVillageChange={setSelectedVillage} />

          <div className={`${styles.itemLocation} ${styles.listLocation}`}>
            <FaMapMarkerAlt className={styles.itemIcon} />
            <Link
              to="/lbdashboard/property-map"
              className={darkMode ? styles.wishlistLinkDark : styles.mapLinkLight}
            >
              View on Property Map
            </Link>
          </div>

          <h1 className={`${styles.listTitle} ${darkMode ? styles.listTitleDark : ''}`}>
            Wish List
          </h1>

          {filteredWishlists.length ? (
            filteredWishlists.map(item => {
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
                      <div
                        className={`${styles.itemTitleWrapper} ${styles.itemTitleWrapperDesktop}`}
                      >
                        <span className={`${styles.listItemTitle} ${styles.itemTitleRight}`}>
                          {item.title}
                        </span>
                      </div>

                      <div className={styles.itemDetails}>
                        <span
                          className={`${styles.listItemTitle} ${styles.itemTitleWrapperDesktop}`}
                        >
                          {item.unit}
                        </span>

                        <div className={styles.listItemAmenities}>
                          <span className={styles.font600}>Available amenities in this unit:</span>
                          <ol>
                            {item.unitAmenities?.map(amenity => (
                              <li key={amenity}>{amenity}</li>
                            ))}
                          </ol>
                        </div>

                        <div className={styles.itemPrice}>
                          <span className={styles.font600}>Basic per night price:</span>{' '}
                          {item.price}
                        </div>

                        <Link
                          to={`/lbdashboard/wishlist/${item.id}/availability`}
                          onClick={() => handleSelectWishlistItem(item)}
                          className={`${styles.listDetails} ${
                            darkMode ? styles.wishlistLinkDark : ''
                          }`}
                        >
                          Click here to view availabilities
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemCardFooter}>
                    <div className={styles.footerLinks}>
                      <Link
                        to={`/lbdashboard/wishlist/${item.id}`}
                        onClick={() => handleSelectWishlistItem(item)}
                        className={`${styles.footerLink} ${
                          darkMode ? styles.wishlistLinkDark : ''
                        }`}
                      >
                        Click for list overview
                      </Link>
                    </div>

                    <Link
                      to={`/lbdashboard/wishlist/${item.id}/chat`}
                      onClick={() => handleSelectWishlistItem(item)}
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
            })
          ) : (
            <p className={styles.noResults}>No properties found</p>
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
  images: PropTypes.arrayOf(PropTypes.string),
  unitAmenities: PropTypes.arrayOf(PropTypes.string),
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

WishList.propTypes = {
  wishlists: PropTypes.arrayOf(wishlistEntryShape),
};

WishList.defaultProps = {
  wishlists: [],
};

const mapStateToProps = state => ({
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishList);

import styles from './WishList.module.css';
import { connect, useDispatch } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { setCurrentWishListItem } from '~/reducers/listBidDashboard/wishListItemReducer';
import Header from '../Header';

function WishList(props) {
  const dispatch = useDispatch();
  const { wishlists } = props;

  return (
    <div className={styles.item}>
      <div className={styles.itemContainer}>
        <Header />

        <div className={`${styles.itemLocation} ${styles.listLocation}`}>
          <FaMapMarkerAlt className={styles.itemIcon} />
          <Link to="/">View on Property Map</Link>
        </div>

        <h1 className={styles.listTitle}>Wish List</h1>

        {wishlists?.map(item => {
          const firstImg = item.images?.[0];
          return (
            <div className={styles.itemBody} key={item.id}>
              <div className={styles.itemDetailsWrapper}>
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

                    <div>
                      <NavItem
                        tag={Link}
                        to={`/lbdashboard/wishlist/${item.id}`}
                        onClick={() => dispatch(setCurrentWishListItem(item))}
                        className={styles.listDetails}
                      >
                        Click here to view availabilities
                      </NavItem>
                    </div>
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <NavItem
                    tag={Link}
                    to={`/lbdashboard/wishlist/${item.id}`}
                    onClick={() => dispatch(setCurrentWishListItem(item))}
                    className={styles.listLink}
                  >
                    Click for list overview
                  </NavItem>

                  <div className={styles.wishlistStartChat}>
                    <button type="button">
                      <img
                        width="24"
                        height="24"
                        src="https://img.icons8.com/material-outlined/24/chat.png"
                        alt=""
                        aria-hidden="true"
                      />
                      Chat with the Host
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishList);

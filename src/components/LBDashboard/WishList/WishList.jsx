import { useMemo, useState } from 'react';
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
  const [selectedVillage, setSelectedVillage] = useState('');

  const villages = useMemo(() => [...new Set(wishlists?.map(item => item.title).filter(Boolean))], [
    wishlists,
  ]);

  const filteredWishlists = selectedVillage
    ? wishlists?.filter(item => item.title === selectedVillage)
    : wishlists;

  return (
    <div className="item">
      <div className="item__container">
        <Header villages={villages} onVillageChange={setSelectedVillage} />

        <div className={`item__location ${styles.list_location}`}>
          <FaMapMarkerAlt className="item__icon" />
          <Link to="/lbdashboard/property-map">View on Property Map</Link>
        </div>

        <h1 className={`${styles.list_title}`}>Wish List</h1>

        {filteredWishlists?.length ? (
          filteredWishlists.map(item => (
            <div className={`${styles.item_body}`} key={item.id}>
              <div className={`${styles.item_detailsWrapper}`}>
                <div className={`${styles.list_detailsLeft}`}>
                  <div className={`${styles.itemTitleWrapperMobile}`}>
                    <h1 className={`${styles.list_itemTitleMobile}`}>{item.title}</h1>
                    <h2 className={`${styles.list_itemTitleMobile}`}>{item.unit}</h2>
                  </div>

                  <img
                    key={item.images[0]}
                    className="carousel-image"
                    src={item.images[0]}
                    alt={item.title}
                  />
                </div>

                <div className={`${styles.list_detailsRight}`}>
                  <div className={`${styles.itemTitleWrapper} ${styles.itemTitleWrapperDesktop}`}>
                    <span className={`${styles.list_itemTitle} ${styles.itemTitleRight}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="item__details">
                    <span className={`${styles.list_itemTitle} ${styles.itemTitleWrapperDesktop}`}>
                      {item.unit}
                    </span>

                    <div className="list_item__amenities">
                      <div>
                        <span className={`${styles.font600}`}>
                          Available amenities in this unit:
                        </span>
                        <ol>
                          {item.unitAmenities?.map(amenity => (
                            <li key={amenity}>{amenity}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.item_price}`}>
                    <span className={`${styles.font600}`}>Basic per night price:</span> {item.price}
                  </div>

                  <div>
                    <NavItem
                      tag={Link}
                      to={`/lbdashboard/wishlist/${item.id}/availability`}
                      onClick={() => {
                        dispatch(setCurrentWishListItem(item));
                      }}
                      className={`${styles.list_details}`}
                    >
                      Click here to view availabilities
                    </NavItem>
                  </div>
                </div>
              </div>

              <div className={`${styles.item_footer}`}>
                <NavItem
                  tag={Link}
                  to={`/lbdashboard/wishlist/${item.id}`}
                  onClick={() => dispatch(setCurrentWishListItem(item))}
                  className={`${styles.list_link}`}
                >
                  Click for list overview
                </NavItem>

                <div className={`${styles.wishlist_start_chat}`}>
                  <NavItem
                    tag={Link}
                    to={`/lbdashboard/wishlist/${item.id}/chat`}
                    onClick={() => dispatch(setCurrentWishListItem(item))}
                    className={`${styles.chat_link}`}
                  >
                    <img
                      width="24"
                      height="24"
                      src="https://img.icons8.com/material-outlined/24/chat.png"
                      alt="chat"
                    />
                    Chat with the Host
                  </NavItem>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.no_results}>No properties found</p>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishList);

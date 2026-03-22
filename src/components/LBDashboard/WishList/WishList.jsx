import styles from './WishList.module.css';
import { connect, useDispatch } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { setCurrentWishListItem } from '~/reducers/listBidDashboard/wishListItemReducer';
import Header from '../Header';

function WishList(props) {
  // const [wishlistId, setWishlistId] = useState('');
  const dispatch = useDispatch();
  const { wishlists } = props;

  return (
    <div className="item">
      <div className="item__container">
        <Header />
        <div className={`item__location ${styles.list_location}`}>
          <FaMapMarkerAlt className="item__icon" />
          <a href="/">View on Property Map</a>
        </div>
        <h1 className={`${styles.list_title}`}>Wish List</h1>
        {wishlists?.map(item => (
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
                  alt="House"
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
                      <span className={`${styles.font600}`}>Available amenities in this unit:</span>
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
                    to={`/lbdashboard/wishlist/${item.id}`}
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
                onClick={() => {
                  dispatch(setCurrentWishListItem(item));
                }}
                className={`${styles.list_link}`}
              >
                Click for list overview
              </NavItem>
              <div className={`${styles.wishlist_start_chat}`}>
                <button type="button">
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/material-outlined/24/chat.png"
                    alt="chat"
                  />
                  Chat with the Host
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  wishlists: state.wishlistItem.wishlists,
});

export default connect(mapStateToProps)(WishList);

import './WishList.css';
import { connect, useDispatch } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { setCurrentWishListItem } from 'reducers/lbdashboard/wishListItemReducer';
import Header from '../Header';

function WishList(props) {
  // const [wishlistId, setWishlistId] = useState('');
  const dispatch = useDispatch();
  const { wishlists } = props;

  return (
    <div className="item">
      <div className="item__container">
        <Header />
        <div className="item__location list__location">
          <FaMapMarkerAlt className="item__icon" />
          <a href="/">View on Property Map</a>
        </div>
        <h1 className="list__title">Wish List</h1>
        {wishlists?.map(item => (
          <div className="item__body" key={item.id}>
            <div className="item__details-wrapper">
              <div className="list__details-left">
                <img
                  key={item.images[0]}
                  className="carousel-image"
                  src={item.images[0]}
                  alt="House"
                />
              </div>
              <div className="list__details-right">
                <div className="item-title_wrapper">
                  <span className="list__item-title item-title-right">{item.title}</span>
                </div>
                <div className="item__details">
                  <span className="list__item-title">{item.unit}</span>
                  <div className="list_item__amenities">
                    <div>
                      <span className="font600">Available amenities in this unit:</span>
                      <ol>
                        {item.unitAmenities?.map(amenity => (
                          <li key={amenity}>{amenity}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="item__price">
                  <span className="font600">Basic per night price:</span> {item.price}
                </div>
                <div>
                  <NavItem
                    tag={Link}
                    to={`/lbdashboard/wishlist/${item.id}`}
                    onClick={() => {
                      dispatch(setCurrentWishListItem(item));
                    }}
                    className="list__details"
                  >
                    Click here to view availabilities
                  </NavItem>
                </div>
              </div>
            </div>
            <div className="item__footer">
              <a href="/" className="list__link">
                Click for list overview
              </a>
              <div className="wishlist__start__chat">
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

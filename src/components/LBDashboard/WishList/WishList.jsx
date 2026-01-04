import './WishList.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import { fetchWishlist } from '../../../actions/lbdashboard/wishlistActions';
import Header from '../Header';

function WishList() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userId = user ? user.userid : null;
  const { loading, wishlists, error } = useSelector(state => state.wishlists);

  useEffect(() => {
    if (userId) dispatch(fetchWishlist(userId));
  }, [dispatch, userId]);

  if (loading) return <div>Loading wishlist...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!wishlists?.listingId?.length) return <div>No items in wishlist.</div>;

  return (
    <div className="item">
      <div className="item__container">
        <Header />
        <div className="item__location list__location">
          <FaMapMarkerAlt className="item__icon" />
          <a href="/">View on Property Map</a>
        </div>
        <h1 className="list__title">Wish List</h1>

        {wishlists.listingId.map(item => (
          <div className="item__body" key={item._id}>
            <div className="item__details-wrapper">
              {/* LEFT */}
              <div className="list__details-left">
                <div className="item-title_wrapper--mobile">
                  <h1 className="list__item-title--mobile">{item.title}</h1>
                  <h2 className="list__item-title--mobile">{item.unit || 'N/A'}</h2>
                </div>
                {item.images?.[0] && (
                  <img className="carousel-image" src={item.images[0]} alt={item.title} />
                )}
              </div>

              {/* RIGHT */}
              <div className="list__details-right">
                <div className="item-title_wrapper item-title_wrapper--desktop">
                  <span className="list__item-title item-title-right">{item.title}</span>
                </div>

                <div className="item__details">
                  <div className="list_item__amenities">
                    <div>
                      <span className="font600">Unit amenities:</span>
                      <ol>
                        {item.amenities?.length ? (
                          item.amenities.map(a => <li key={a}>{a}</li>)
                        ) : (
                          <li>No amenities listed</li>
                        )}
                      </ol>
                    </div>

                    <div>
                      <span className="font600">Village amenities:</span>
                      <ol>
                        {item.villageAmenities?.length ? (
                          item.villageAmenities.map(a => <li key={a}>{a}</li>)
                        ) : (
                          <li>No village amenities listed</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="item__price">
                  <span className="font600">Price per night:</span> {item.price}
                </div>

                {/* Dynamic URL with listing._id */}
                <NavItem
                  tag={Link}
                  to={`/lbdashboard/wishlist/${item._id}`}
                  className="list__details"
                >
                  View this listing
                </NavItem>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WishList;

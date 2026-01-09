import styles from './WishList.module.css';
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
    <div className={styles.item}>
      <div className={styles.item__container}>
        <Header />
        <div className={styles.list__location}>
          <FaMapMarkerAlt className={styles.item__icon} />
          <a href="/">View on Property Map</a>
        </div>
        <h1 className={styles.list__title}>Wish List</h1>

        {wishlists.listingId.map(item => (
          <div className={styles.item__body} key={item._id}>
            <div className={styles.item__details_wrapper}>
              {/* LEFT */}
              <div className={styles.list__details_left}>
                <div className={styles.item_title_wrapper__mobile}>
                  <h1 className={styles.list__item_title_mobile}>{item.title}</h1>
                  <h2 className={styles.list__item_title_mobile}>{item.unit || ''}</h2>
                </div>
                {item.images?.[0] && (
                  <img className={styles.carousel_image} src={item.images[0]} alt={item.title} />
                )}
              </div>

              {/* RIGHT */}
              <div className={styles.list__details_right}>
                <div className={styles.item_title_wrapper__desktop}>
                  <span className={styles.item_title_right}>{item.title}</span>
                </div>

                <div className={styles.item__details}>
                  <div className={styles.list_item_amenities}>
                    <div>
                      <span className={styles.font600}>Available amenities in unit:</span>
                      <ol>
                        {item.amenities?.length ? (
                          item.amenities.map(a => <li key={a}>{a}</li>)
                        ) : (
                          <li>No amenities listed</li>
                        )}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className={styles.item__price}>
                  <span className={styles.font600}>Basic per night price:</span> ${item.price}/DAY
                </div>

                <NavItem
                  tag={Link}
                  to={`/lbdashboard/wishlist/${item._id}`}
                  className={styles.list__details}
                >
                  Click here to view availabilities
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

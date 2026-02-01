import styles from './ItemOverview.module.css';
import { useEffect, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { BsChat } from 'react-icons/bs';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import ImageCarousel from '../Components/ImageCarousel';
import LBDashboardHeader from '../LBDashboardHeader';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../../actions/lbdashboard/wishlistActions';
import { toast } from 'react-toastify';
import Header from '../../Header';
function WishListItem() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { wishlists } = useSelector(state => state.wishlists);

  const listing = wishlists?.listingId?.find(item => item._id === id);
  const user = useSelector(state => state.auth.user);
  const userId = user?.userid;
  console.log('User ID:', userId);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    return wishlists?.listingId?.some(item => item._id === id) ?? false;
  });

  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    if (backToTopButton) backToTopButton.style.display = 'none';
    return () => {
      if (backToTopButton) backToTopButton.style.display = 'block';
    };
  }, []);

  if (!listing) return <div>Loading listing...</div>;

  const handleWishlistToggle = async () => {
    if (!userId) return alert('Please login to save listings.');

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(userId, id));
        toast.info('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(userId, id));
        toast.success('Added to wishlist');
      }
      setIsWishlisted(prev => !prev);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  return (
    <div className={styles.item_overview_module}>
      <Header />
      <LBDashboardHeader />
      <div className={styles.item__overview}>
        {/* LEFT SIDE */}
        <div className={styles['item__details-left']}>
          <ImageCarousel images={listing.images || []} />

          <div className={styles.item__amenities}>
            <div>
              <h3>Unit amenities:</h3>
              {listing.amenities?.length ? (
                <ul>
                  {listing.amenities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p>No unit amenities listed</p>
              )}
            </div>
            <div>
              <h3>Village amenities:</h3>
              {listing.villageAmenities?.length ? (
                <ul>
                  {listing.villageAmenities.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p>No village amenities listed</p>
              )}
            </div>
          </div>

          <div className={styles.item__location}>
            <FaMapMarkerAlt />
            <a href="/">View on Property Map</a>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles['item__details-right']}>
          <h2>{listing.unit || ''}</h2>
          <h1>{listing.title}</h1>
          <p className={styles.price}>
            Price per night: <b>${listing.price}</b>
          </p>
          <p>{listing.description}</p>
          <div className={styles['item__form']}>
            <div className={styles['item__rent']}>
              <label htmlFor="from">
                Renting from
                <input type="date" name="from" id="from" />
              </label>
              <label htmlFor="to">
                Rent to
                <input type="date" name="to" id="to" />
              </label>
            </div>
            <div className={styles['item__bidding']}>
              <label htmlFor="name">
                Name:
                <input type="text" name="name" id="name" placeholder="Name" />
              </label>
              <label htmlFor="bidding">
                Bidding Price:
                <input type="number" name="bidding" id="bidding" placeholder="Bidding Price" />
              </label>
            </div>
            <button type="button">Proceed to submit with details</button>
          </div>
          <div className={styles['err-message']}>
            <h6>The Dates you picked are not available</h6>
            <a href="/">Click here to see available dates</a>
          </div>
          <div className={styles['footer__icons']}>
            <button type="button" onClick={handleWishlistToggle}>
              {isWishlisted ? <IoMdHeart className={styles.saved__item} /> : <IoMdHeartEmpty />}
              Save
            </button>
            <button type="button">
              <BsChat /> Chat with the Host
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WishListItem;

import styles from './ItemOverview.module.css';
import { useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import ImageCarousel from '../Components/ImageCarousel';
import Header from '../Header';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function WishListItem() {
  const { listingId } = useParams(); // get :listingId from URL
  const { wishlists } = useSelector(state => state.wishlists);

  // Find listing by _id from Redux store
  const listing = wishlists?.listingId?.find(item => item._id === listingId);

  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    if (backToTopButton) backToTopButton.style.display = 'none';
    return () => {
      if (backToTopButton) backToTopButton.style.display = 'block';
    };
  }, []);

  if (!listing) return <div>Loading listing...</div>;

  return (
    <div className={styles.item_overview_module}>
      <Header />

      <div className={styles.item__overview}>
        {/* LEFT SIDE */}
        <div className={styles['item__details-left']}>
          <h2>{listing.unit || 'N/A'}</h2>
          <h1>{listing.title}</h1>

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
          <p className={styles.price}>
            Price per night: <b>${listing.price}</b>
          </p>
          <p>{listing.description}</p>
        </div>
      </div>
    </div>
  );
}

export default WishListItem;

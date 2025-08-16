import styles from './ItemOverview.module.css';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { FaMapMarkerAlt } from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import { BsChat } from 'react-icons/bs';
import ImageCarousel from '../Components/ImageCarousel';
import Header from '../Header';
import { Link } from 'react-router-dom';

const item = {
  title: 'Cob Village',
  unit: 'Unit 405',
  images: [
    'https://picsum.photos/700/400?random=1',
    'https://picsum.photos/700/400?random=2',
    'https://picsum.photos/700/400?random=3',
  ],
  unitAmenities: ['Solar powered infrastructure', 'Sustainably developed decorations'],
  villageAmenities: [
    'Passive Heating and Cooling',
    'Rainwater Harvesting Systems',
    'Workshops and Demonstration Spaces',
  ],
  location: 'Location',
  price: '$25/Day',
};

function WishListItem(props) {
  const [isWishlist, setIsWishlist] = useState(true);
  const [currWishlistItem, setCurrWishlistItem] = useState(item);

  const { wishlistItem } = props;

  // We don't need the back to top button on this page
  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    backToTopButton.style.display = 'none';
    return () => {
      backToTopButton.style.display = 'block';
    };
  }, []);

  useEffect(() => {
    if (wishlistItem) {
      setCurrWishlistItem(wishlistItem);
    }
  }, [wishlistItem]);

  return (
    <div className={styles.item}>
      <div className={styles.itemContainer}>
        <Header />

        <div className={styles.itemOverview}>
          <div className={styles.itemDetailsLeft}>
            <div className={styles.itemListingDetailsMobile}>
              <h1>{currWishlistItem.unit}</h1>
              <h1>{currWishlistItem.title}</h1>
            </div>

            <div className={styles.itemImages}>
              <ImageCarousel images={currWishlistItem.images} />
            </div>

            <div className={styles.itemAmenities}>
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol className={styles.marginLeft}>
                  {currWishlistItem.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol className={styles.marginLeft}>
                  {currWishlistItem.villageAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={styles.itemLocation}>
              <FaMapMarkerAlt className={styles.itemIcon} />
              <Link to="/">View on Property Map</Link>
            </div>
          </div>

          <div className={styles.itemDetailsRight}>
            <div className={styles.itemListingDetails}>
              <h1 className={styles.itemListingDetailsDesktop}>{currWishlistItem.unit}</h1>
              <h1 className={styles.itemListingDetailsDesktop}>{currWishlistItem.title}</h1>
              <span>
                This unit sells for a basic price of <b>{currWishlistItem.price}</b>. If you wish to
                book it in advance, bid your price and leave your details below and we will get back
                to you if you are our highest bidder. Make sure your starting date is at least{' '}
                <b>2 weeks</b> from now.
              </span>
            </div>

            <div className={styles.itemForm}>
              <div className={styles.itemRent}>
                <label htmlFor="from">
                  Renting from
                  <input type="date" name="from" id="from" />
                </label>
                <label htmlFor="to">
                  Rent to
                  <input type="date" name="to" id="to" />
                </label>
              </div>

              <div className={styles.itemBidding}>
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

            <div className={styles.errMessage}>
              <h6>The Dates you picked are not available</h6>
              <Link to="/">Click here to see available dates</Link>
            </div>

            <div className={styles.footerIcons}>
              <div className={styles.saveList}>
                <button type="button" onClick={() => setIsWishlist(prev => !prev)}>
                  {isWishlist ? <IoMdHeart className={styles.savedItem} /> : <IoMdHeartEmpty />}
                  &nbsp;Save
                </button>
              </div>

              <div className={styles.startChat}>
                <button type="button">
                  <BsChat />
                  &nbsp;Chat with the Host
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  wishlistItem: state.wishlistItem.wishListItem,
});

export default connect(mapStateToProps)(WishListItem);

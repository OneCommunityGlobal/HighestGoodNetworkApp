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
    <div className={`item ${styles['item_overview_module']}`}>
      <div className={styles['item__container']}>
        <Header />
        <div className={styles['item__overview']}>
          <div className={styles['item__details-left']}>
            <div
              className={`${styles['item__listing-details']} ${styles['item__listing-details--mobile']}`}
            >
              <h1>{currWishlistItem.unit}</h1>
              <h1>{currWishlistItem.title}</h1>
            </div>
            <div className={styles['item__images']}>
              <ImageCarousel images={currWishlistItem.images} />
            </div>
            <div className={styles['item__amenities']}>
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol className={styles['margin__left']}>
                  {currWishlistItem.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol className={styles['margin__left']}>
                  {currWishlistItem.villageAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={styles['item__location']}>
              <FaMapMarkerAlt className={styles['item__icon']} />
              <Link to="/">View on Property Map</Link>
            </div>
          </div>
          <div className={styles['item__details-right']}>
            <div className={styles['item__listing-details']}>
              <h1 className={styles['item__listing-details--desktop']}>{currWishlistItem.unit}</h1>
              <h1 className={styles['item__listing-details--desktop']}>{currWishlistItem.title}</h1>
              <span>
                This unit sells for a basic price of <b>{currWishlistItem.price}</b>. If you wish to
                book it in advance, bid your price and leave your details below and we will get back
                to you if you are our highest bidder. Make sure your starting date is at least{' '}
                <b>2 weeks</b> from now.
              </span>
            </div>
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
              <Link to="/">Click here to see available dates</Link>
            </div>
            <div className={styles['footer__icons']}>
              <div className={styles['save__list']}>
                <button
                  type="button"
                  onClick={() => {
                    setIsWishlist(!isWishlist);
                  }}
                >
                  {isWishlist ? (
                    <IoMdHeart className={styles['saved__item']} />
                  ) : (
                    <IoMdHeartEmpty />
                  )}
                  &nbsp;Save
                </button>
              </div>
              <div className={styles['start__chat']}>
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

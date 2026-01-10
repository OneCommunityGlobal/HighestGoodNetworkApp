import styles from './ItemOverview.module.css';
import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';

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

const getClassNames = (baseClass, darkClass, darkMode) =>
  `${baseClass} ${darkMode ? darkClass : ''}`;

function WishListItem(props) {
  const [isWishlist, setIsWishlist] = useState(true);
  const [currWishlistItem, setCurrWishlistItem] = useState(item);
  const darkMode = useSelector(state => state.theme.darkMode);

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
    <div
      className={`item ${getClassNames(
        styles['item_overview_module'],
        styles['item_overview_module--dark'],
        darkMode,
      )}`}
    >
      <div
        className={getClassNames(
          styles['item__container'],
          styles['item__container--dark'],
          darkMode,
        )}
      >
        <Header />
        <div
          className={getClassNames(
            styles['item__overview'],
            styles['item__overview--dark'],
            darkMode,
          )}
        >
          <div
            className={getClassNames(
              styles['item__details-left'],
              styles['item__details-left--dark'],
              darkMode,
            )}
          >
            <div
              className={`${getClassNames(
                styles['item__listing-details'],
                styles['item__listing-details--dark'],
                darkMode,
              )} ${styles['item__listing-details--mobile']}`}
            >
              <h1 className={getClassNames('', styles['item__heading--dark'], darkMode)}>
                {currWishlistItem.unit}
              </h1>
              <h1 className={getClassNames('', styles['item__heading--dark'], darkMode)}>
                {currWishlistItem.title}
              </h1>
            </div>
            <div className={styles['item__images']}>
              <ImageCarousel images={currWishlistItem.images} darkMode={darkMode} />
            </div>
            <div
              className={getClassNames(
                styles['item__amenities'],
                styles['item__amenities--dark'],
                darkMode,
              )}
            >
              <div>
                <h2
                  className={getClassNames('', styles['item__amenities-heading--dark'], darkMode)}
                >
                  Available amenities in this unit:
                </h2>
                <ol className={styles['margin__left']}>
                  {currWishlistItem.unitAmenities?.map(amenity => (
                    <li
                      key={amenity}
                      className={getClassNames('', styles['item__amenities-text--dark'], darkMode)}
                    >
                      {amenity}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h2
                  className={getClassNames('', styles['item__amenities-heading--dark'], darkMode)}
                >
                  Village level amenities:
                </h2>
                <ol className={styles['margin__left']}>
                  {currWishlistItem.villageAmenities?.map(amenity => (
                    <li
                      key={amenity}
                      className={getClassNames('', styles['item__amenities-text--dark'], darkMode)}
                    >
                      {amenity}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div
              className={getClassNames(
                styles['item__location'],
                styles['item__location--dark'],
                darkMode,
              )}
            >
              <FaMapMarkerAlt className={styles['item__icon']} />
              <Link
                to="/"
                className={getClassNames('', styles['item__location-link--dark'], darkMode)}
              >
                View on Property Map
              </Link>
            </div>
          </div>
          <div
            className={getClassNames(
              styles['item__details-right'],
              styles['item__details-right--dark'],
              darkMode,
            )}
          >
            <div
              className={getClassNames(
                styles['item__listing-details'],
                styles['item__listing-details--dark'],
                darkMode,
              )}
            >
              <h1
                className={`${styles['item__listing-details--desktop']} ${getClassNames(
                  '',
                  styles['item__heading--dark'],
                  darkMode,
                )}`}
              >
                {currWishlistItem.unit}
              </h1>
              <h1
                className={`${styles['item__listing-details--desktop']} ${getClassNames(
                  '',
                  styles['item__heading--dark'],
                  darkMode,
                )}`}
              >
                {currWishlistItem.title}
              </h1>
              <span className={getClassNames('', styles['item__description--dark'], darkMode)}>
                This unit sells for a basic price of <b>{currWishlistItem.price}</b>. If you wish to
                book it in advance, bid your price and leave your details below and we will get back
                to you if you are our highest bidder. Make sure your starting date is at least{' '}
                <b>2 weeks</b> from now.
              </span>
            </div>
            <div
              className={getClassNames(styles['item__form'], styles['item__form--dark'], darkMode)}
            >
              <div className={styles['item__rent']}>
                <label
                  htmlFor="from"
                  className={getClassNames('', styles['item__form-label--dark'], darkMode)}
                >
                  Renting from
                  <input
                    type="date"
                    name="from"
                    id="from"
                    className={getClassNames(
                      styles['item__form-input'],
                      styles['item__form-input--dark'],
                      darkMode,
                    )}
                    style={darkMode ? { colorScheme: 'dark' } : {}}
                  />
                </label>
                <label
                  htmlFor="to"
                  className={getClassNames('', styles['item__form-label--dark'], darkMode)}
                >
                  Rent to
                  <input
                    type="date"
                    name="to"
                    id="to"
                    className={getClassNames(
                      styles['item__form-input'],
                      styles['item__form-input--dark'],
                      darkMode,
                    )}
                    style={darkMode ? { colorScheme: 'dark' } : {}}
                  />
                </label>
              </div>
              <div className={styles['item__bidding']}>
                <label
                  htmlFor="name"
                  className={getClassNames('', styles['item__form-label--dark'], darkMode)}
                >
                  Name:
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name"
                    className={getClassNames(
                      styles['item__form-input'],
                      styles['item__form-input--dark'],
                      darkMode,
                    )}
                  />
                </label>
                <label
                  htmlFor="bidding"
                  className={getClassNames('', styles['item__form-label--dark'], darkMode)}
                >
                  Bidding Price:
                  <input
                    type="number"
                    name="bidding"
                    id="bidding"
                    placeholder="Bidding Price"
                    className={getClassNames(
                      styles['item__form-input'],
                      styles['item__form-input--dark'],
                      darkMode,
                    )}
                  />
                </label>
              </div>
              <button
                type="button"
                className={getClassNames(
                  styles['item__form-submit'],
                  styles['item__form-submit--dark'],
                  darkMode,
                )}
              >
                Proceed to submit with details
              </button>
            </div>
            <div
              className={getClassNames(
                styles['err-message'],
                styles['err-message--dark'],
                darkMode,
              )}
            >
              <h6>The Dates you picked are not available</h6>
              <Link
                to="/"
                className={getClassNames('', styles['item__error-link--dark'], darkMode)}
              >
                Click here to see available dates
              </Link>
            </div>
            <div className={styles['footer__icons']}>
              <div className={styles['save__list']}>
                <button
                  type="button"
                  className={getClassNames(
                    styles['save__list-button'],
                    styles['save__list-button--dark'],
                    darkMode,
                  )}
                  onClick={() => {
                    setIsWishlist(!isWishlist);
                  }}
                >
                  {isWishlist ? (
                    <IoMdHeart className={styles['saved__item']} />
                  ) : (
                    <IoMdHeartEmpty
                      className={getClassNames('', styles['item__icon-empty--dark'], darkMode)}
                    />
                  )}
                  &nbsp;Save
                </button>
              </div>
              <div className={styles['start__chat']}>
                <button
                  type="button"
                  className={getClassNames(
                    styles['start__chat-button'],
                    styles['start__chat-button--dark'],
                    darkMode,
                  )}
                >
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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from '../../../actions/userManagement';
import ListingAvailability from './ListingAvailability';
import {
  bookListing,
  fetchListingAvailability,
  fetchListingById,
  resetBooking,
} from '../../../actions/lbDashboard/listOverviewAction';
import logo from '../../../assets/images/logo2.png';
import mapIcon from '../../../assets/images/mapIcon.png';

const STOCK_IMAGE = 'https://www.caspianpolicy.org/no-image.png';
const today = new Date().toISOString().split('T')[0];
import styles from './Listoverview.module.css';

function ListOverview() {
  const [showAvailability, setShowAvailability] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const { id: listingId } = useParams();
  const dispatch = useDispatch();
  const { listing, loading, error } = useSelector(state => state.listOverview);
  const bookingState = useSelector(state => state.listingBooking);
  const user = useSelector(state => state.auth.user);
  const userProfiles = useSelector(state => state.allUserProfilesBasicInfo.userProfilesBasicInfo);
  const currentUserProfile = userProfiles?.find(profile => profile._id === user?.userid);
  const { availability, loading: availLoading, error: availError } = useSelector(
    state => state.listingAvailability,
  );

  function isRangeAvailable(from, to, availabilityDate) {
    if (!from || !to || !availabilityDate) return false;
    const fromDateObj = new Date(from);
    const toDateObj = new Date(to);

    const isOverlapping = arr =>
      arr?.some(b => {
        const bFrom = new Date(b.from);
        const bTo = new Date(b.to);
        return fromDateObj <= bTo && toDateObj >= bFrom;
      });

    if (
      isOverlapping(availabilityDate.bookedDates) ||
      isOverlapping(availabilityDate.blockedOutDates)
    ) {
      return false;
    }
    return true;
  }

  const handleBookingCheck = () => {
    if (!fromDate || !toDate) {
      setBookingError('Please select both dates.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setBookingError('From date cannot be after To date.');
      return;
    }
    if (!isRangeAvailable(fromDate, toDate, availability)) {
      setBookingError('The Dates you picked are not available');
      setShowBookingConfirm(false);
      return;
    }
    setBookingError('');
    setShowBookingConfirm(true);
  };

  const handleConfirmBooking = () => {
    if (bookingState.success) return;
    dispatch(
      bookListing({
        listingId: listing._id,
        from: fromDate,
        to: toDate,
        userId: currentUserProfile?._id,
      }),
    );
  };

  useEffect(() => {
    if (listingId) {
      dispatch(fetchListingById(listingId));
      dispatch(fetchListingAvailability(listingId));
    }
  }, [listingId, dispatch]);

  useEffect(() => {
    dispatch(getUserProfileBasicInfo());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!listing) return <div>No listing found.</div>;

  return (
    <div className={`${styles.mainContainer}`}>
      <div className={`${styles.logoContainer}`}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={`${styles.contentContainer}`}>
        <div className={`${styles.containerTop}`} />
        <div className={`${styles.containerMain}`}>
          <div className={`${styles.detailsLeft}`}>
            <div className={`${styles.listingDetails} ${styles.mobileDisplay}`}>
              <h1>{listing.title}</h1>
            </div>
            <div className={`${styles.imageCarousel}`}>
              <Carousel>
                {(listing.images && listing.images.length > 0 ? listing.images : [STOCK_IMAGE]).map(
                  (image, index) => (
                    <Carousel.Item key={image}>
                      <img
                        className="d-block w-100"
                        src={image}
                        alt={`Slide ${index + 1}`}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = STOCK_IMAGE;
                        }}
                      />
                    </Carousel.Item>
                  ),
                )}
              </Carousel>
            </div>

            <div className={`${styles.amenities}`}>
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol className={`${styles.amenitiesList}`}>
                  {listing.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol className={`${styles.amenitiesList}`}>
                  {listing.villageAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={`${styles.location}`}>
              <img src={mapIcon} alt="Map Icon" />
              <a href="/">{listing.location}</a>
            </div>
          </div>
          <div className={`${styles.detailsRight}`}>
            <div className={`${styles.listingDetails}`}>
              <h1 className={`${styles.desktopDisplay}`}>{listing.title}</h1>
              <p>{listing.description}</p>
            </div>
            <div className={`${styles.rentForm}`}>
              <label htmlFor="from">
                Rent from
                <input
                  type="date"
                  name="from"
                  id="from"
                  value={fromDate}
                  min={today}
                  max={toDate}
                  onChange={e => setFromDate(e.target.value)}
                />
              </label>
              <label htmlFor="to">
                Rent to
                <input
                  type="date"
                  name="to"
                  id="to"
                  value={toDate}
                  min={fromDate || today}
                  onChange={e => setToDate(e.target.value)}
                />
              </label>
              <button type="button" onClick={handleBookingCheck}>
                Check Availability
              </button>
              <button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  setShowAvailability(true);
                }}
              >
                Click here to see available dates
              </button>
            </div>
            {bookingError && (
              <div className="error-message">
                <h6>{bookingError}</h6>
              </div>
            )}
            {showBookingConfirm && (
              <div className={`${styles.bookingConfirm}`}>
                <button
                  type="button"
                  className={`${styles.closeBtn}`}
                  onClick={() => {
                    setShowBookingConfirm(false);
                    dispatch(resetBooking());
                  }}
                >
                  ×
                </button>
                <h4>Confirm Your Booking</h4>
                <div>
                  <strong>From:</strong> {fromDate}
                </div>
                <div>
                  <strong>To:</strong> {toDate}
                </div>
                <div>
                  <strong>Name:</strong>{' '}
                  {currentUserProfile
                    ? `${currentUserProfile.firstName} ${currentUserProfile.lastName}`
                    : 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {user?.email || 'N/A'}
                </div>
                {!bookingState.success && (
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={bookingState.loading || bookingState.success}
                    className={`${styles.confirmBookingBtn}`}
                  >
                    {bookingState.loading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                )}
                {bookingState.error && <div className="error-message">{bookingState.error}</div>}
                {bookingState.success && <div className="text-success">Booking successful!</div>}
              </div>
            )}
            {showAvailability && (
              <ListingAvailability
                listingId={listing._id}
                availability={availability}
                loading={availLoading}
                error={availError}
                userId={user?.userid}
                onClose={() => setShowAvailability(false)}
              />
            )}
            <div className={`${styles.chatHost}`}>
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
      </div>
    </div>
  );
}

export default ListOverview;

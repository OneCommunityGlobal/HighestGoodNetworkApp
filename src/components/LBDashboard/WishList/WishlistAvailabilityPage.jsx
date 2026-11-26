import { useHistory, useParams } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Header from '../Header';
import ListingAvailability from '../ListingOverview/ListingAvailability';
import styles from './WishlistAvailabilityPage.module.css';

function WishlistAvailabilityPage({ availability, loading, error }) {
  const { id } = useParams();
  const history = useHistory();
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleClose = () => {
    history.push(`/lbdashboard/wishlist/${id}`);
  };

  return (
    <div className={`${styles.page} ${darkMode ? styles['page--dark'] : ''}`}>
      <Header />
      <ListingAvailability
        listingId={id}
        availability={availability}
        loading={loading}
        error={error}
        onClose={handleClose}
      />
    </div>
  );
}

WishlistAvailabilityPage.propTypes = {
  availability: PropTypes.shape({}),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

WishlistAvailabilityPage.defaultProps = {
  availability: null,
  loading: false,
  error: null,
};

const mapStateToProps = state => ({
  availability: state.listingAvailability.availability,
  loading: state.listingAvailability.loading,
  error: state.listingAvailability.error,
});

export default connect(mapStateToProps)(WishlistAvailabilityPage);

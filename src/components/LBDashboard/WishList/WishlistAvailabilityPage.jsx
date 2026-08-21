import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ListingAvailability from '../ListingOverview/ListingAvailability';

function WishlistAvailabilityPage({ availability, loading, error }) {
  const { id } = useParams();
  const history = useHistory();

  const handleClose = () => {
    history.push(`/lbdashboard/wishlist/${id}`);
  };

  return (
    <ListingAvailability
      listingId={id}
      availability={availability}
      loading={loading}
      error={error}
      onClose={handleClose}
    />
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

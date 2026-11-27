import PropTypes from 'prop-types';
import ExpenditureCard from './ExpenditureCard';

function SingleExpenditureCard({ pieType }) {
  return <ExpenditureCard mode="stacked" pieType={pieType} />;
}

SingleExpenditureCard.propTypes = {
  pieType: PropTypes.string,
};

export default SingleExpenditureCard;

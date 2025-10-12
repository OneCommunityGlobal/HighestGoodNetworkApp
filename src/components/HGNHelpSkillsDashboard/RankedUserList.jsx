import PropTypes from 'prop-types';
import UserCard from './UserCard';
import styles from './style/UserCard.module.css';

function RankedUserList({ users, loading, error, emptyMessage }) {
  if (loading) {
    return <p>Loading community members...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  if (!users.length) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className={styles.containerGrid}>
      {users.map(user => (
        <UserCard key={user._id || user.email || user.name} user={user} />
      ))}
    </div>
  );
}

RankedUserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  emptyMessage: PropTypes.string.isRequired,
};

RankedUserList.defaultProps = {
  error: null,
};

export default RankedUserList;

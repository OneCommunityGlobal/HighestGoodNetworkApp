import PropTypes from 'prop-types';
import styles from './UserManagement.module.css';

const mockUsers = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 123-4567',
    registrationDate: 'Jan 10, 2024',
  },
  {
    id: 2,
    firstName: 'Marcus',
    lastName: 'Webb',
    email: 'marcus.webb@example.com',
    phone: '+1 (555) 234-5678',
    registrationDate: 'Feb 3, 2024',
  },
  {
    id: 3,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+1 (555) 345-6789',
    registrationDate: 'Feb 17, 2024',
  },
  {
    id: 4,
    firstName: 'Daniel',
    lastName: 'Cruz',
    email: 'daniel.cruz@example.com',
    phone: '+1 (555) 456-7890',
    registrationDate: 'Mar 5, 2024',
  },
  {
    id: 5,
    firstName: 'Sofia',
    lastName: 'Nguyen',
    email: 'sofia.nguyen@example.com',
    phone: '+1 (555) 567-8901',
    registrationDate: 'Mar 22, 2024',
  },
  {
    id: 6,
    firstName: 'Ethan',
    lastName: 'Patel',
    email: 'ethan.patel@example.com',
    phone: '+1 (555) 678-9012',
    registrationDate: 'Apr 8, 2024',
  },
];

function UserManagement({ darkMode }) {
  if (mockUsers.length === 0) {
    return (
      <div className={`${styles.emptyState} ${darkMode ? styles.darkText : ''}`}>
        No registered users found.
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={`${styles.table} ${darkMode ? styles.darkTable : ''}`}>
        <thead>
          <tr className={`${styles.tableHead} ${darkMode ? styles.darkTableHead : ''}`}>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Registration Date</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map(user => (
            <tr key={user.id} className={darkMode ? styles.darkRow : ''}>
              <td className={darkMode ? styles.darkCell : ''}>{user.firstName}</td>
              <td className={darkMode ? styles.darkCell : ''}>{user.lastName}</td>
              <td className={darkMode ? styles.darkCell : ''}>{user.email}</td>
              <td className={darkMode ? styles.darkCell : ''}>{user.phone}</td>
              <td className={darkMode ? styles.darkCell : ''}>{user.registrationDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

UserManagement.propTypes = {
  darkMode: PropTypes.bool,
};

export default UserManagement;

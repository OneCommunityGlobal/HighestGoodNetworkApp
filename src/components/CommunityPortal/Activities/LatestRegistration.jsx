import styles from './styles.module.css';

function LatestRegistration() {
  return (
    <div className={`${styles.latestRegistration}`}>
      <h2 className={`${styles.headerTitle}`}>Latest Registration</h2>
      <ul>
        <li>
          <div className={`${styles.registerinfo}`}>
            <p>
              <strong>Marvin McKinney</strong> applied for the event <strong>Tree Planting</strong>
            </p>
            <span className={`${styles.time}`}>10 mins ago</span>
          </div>
          <button type="button" className={`${styles.approveBtn}`}>
            Approve
          </button>
        </li>
        <li>
          <div className={`${styles.registerinfo}`}>
            <p>
              <strong>Jane Copper</strong> applied for the event <strong>Tree Planting</strong>
            </p>
            <span className={`${styles.time}`}>13 mins ago</span>
          </div>
          <button type="button" className={`${styles.approveBtn}`}>
            Approve
          </button>
        </li>
        <li>
          <div className={`${styles.registerinfo}`}>
            <p>
              <strong>Jenny Wilson</strong> applied for the event <strong>Home Cookies</strong>
            </p>
            <span className={`${styles.time}`}>21 mins ago</span>
          </div>
          <button type="button" className={`${styles.approveBtn}`}>
            Approve
          </button>
        </li>
      </ul>
    </div>
  );
}

export default LatestRegistration;

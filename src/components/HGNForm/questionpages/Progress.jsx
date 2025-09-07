import styles from '../styles/Progress.module.css';

function Progress({ progressValue }) {
  return (
    <div className={`${styles.progressHgnContainer}`}>
      <div className={`${styles.progressHgnBar}`}>
        <div
          className={`${styles.progressHgn}`}
          style={{ width: `${progressValue}%` }} // Dynamic width based on progress value (page number)
        />
      </div>
    </div>
  );
}

export default Progress;

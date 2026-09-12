import styles from '../styles/Banner.module.css';

function Banner() {
  return (
    <div className={`${styles.banner}`}>
      <img src="/header.png" alt="HGN Banner" />
    </div>
  );
}

export default Banner;

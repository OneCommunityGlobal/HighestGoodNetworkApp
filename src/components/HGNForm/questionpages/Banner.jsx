import styles from '../styles/Banner.module.css';

function Banner() {
  return (
    <div className={`${styles.banner}`}>
      <img src="/header.webp" alt="HGN Banner" />
    </div>
  );
}

export default Banner;

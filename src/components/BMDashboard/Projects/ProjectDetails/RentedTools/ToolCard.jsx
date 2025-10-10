import styles from '../ProjectDetails.module.css';
function ToolCard() {
  return (
    <div className={`${styles.singleCard}`}>
      <div className={`${styles.singleCardImg}`}>
        <img
          alt=""
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          width="100%"
        />
      </div>
      <div className={`${styles.singleCardBody}`}>
        <h3>Card title</h3>
        <div className={`${styles.singleCardInfo}`}>Term ends in __ hours.</div>
      </div>
    </div>
  );
}

export default ToolCard;

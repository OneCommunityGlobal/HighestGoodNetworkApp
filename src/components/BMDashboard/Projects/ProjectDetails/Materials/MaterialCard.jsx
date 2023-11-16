function MaterialCard() {
  return (
    <div className="single-card">
      <div className="single-card__img">
        <img
          alt=""
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          width="100%"
        />
      </div>
      <div className="single-card__body">
        <h3>Card title</h3>
        <div className="single-card__info">Term ends in __ hours.</div>
      </div>
    </div>
  );
}

export default MaterialCard;

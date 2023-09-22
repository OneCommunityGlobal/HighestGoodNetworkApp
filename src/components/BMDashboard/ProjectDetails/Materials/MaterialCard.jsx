function MaterialCard() {
  return (
    <div className="singleCard">
      <div className="cardImg">
        <img
          alt=""
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          width="100%"
        />
      </div>
      <div className="cardBody">
        <h3>Card title</h3>
        <div className="infoDiv">Term ends in __ hours.</div>
      </div>
    </div>
  );
}

export default MaterialCard;

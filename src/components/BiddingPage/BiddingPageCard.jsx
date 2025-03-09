function BiddingPageCard({ image, title, amount }) {
  return (
    <div className="bidding-Card-container">
      <div className="bidding-Card-image">
        <img src={image} alt={title} />
      </div>
      <div className="bidding-Card-text">
        <h1>{title}</h1>
        <p>Current bid: ${amount} / night</p>
      </div>
      <div className="bidding-Card-button">
        <p>Bid now</p>
      </div>
    </div>
  );
}

export default BiddingPageCard;

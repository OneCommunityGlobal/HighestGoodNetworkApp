import './PaymentDetails.css';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Header from '../Header';

function PaymentDetails(props) {
  return (
    <div className="item">
      <div className="item__container">
        <Header />
        <div className="item__overview">
          <div className="item__details">
            <img
              className="carousel-image"
              src="https://picsum.photos/700/400?random=1"
              alt="Unit"
            />
            <span>
              Unit 405, Earthbag Village - <a href="/">Click for more photos</a>
            </span>
            <div className="item__form">
              <h1>Booking Details</h1>
              <div className="item__details__title">
                <span>Date: 12/17 - 12/21</span>
                <span>Amount Due: $140</span>
              </div>
              <div className="item__basic__details">
                <label htmlFor="name">
                  <input type="text" name="name" id="name" placeholder="Name" />
                </label>
                <label htmlFor="email">
                  <input type="email" name="email" id="email" placeholder="Email" />
                </label>
                <label htmlFor="phone">
                  <input type="number" name="phone" id="phone" placeholder="Phone Number" />
                </label>
              </div>
              <div className="item__payment">
                <label htmlFor="card">
                  <input type="text" name="card" id="card" placeholder="Credit/Debit Card Number" />
                </label>
                <label htmlFor="security">
                  <input
                    type="password"
                    name="security"
                    id="security"
                    placeholder="Security Code"
                  />
                </label>
                <label htmlFor="expiry">
                  <input type="date" name="expiry" id="expiry" placeholder="Expiry" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

export default connect(mapStateToProps)(PaymentDetails);

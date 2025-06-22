import React, { useState, useRef } from "react";
import "./reviewForm.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faCamera } from "@fortawesome/free-solid-svg-icons";
import ReviewCard from "./ReviewCard";
import logo from "../../../assets/images/logo2.png";
import sampleUnit from '../../../assets/images/sample.jpg'; // Replace with your actual bidding image

function ShowReviews() {

    const testReviews = [
        {
          userName: "John Doe",
          userImage: "https://i.pravatar.cc/300?img=3",

          reviewDescription: "This is an awesome product. I loved it!",
          stars: 5,
          date: "2023-08-15",
        },
        {
          userName: "Jane Smith",
          userImage: "https://i.pravatar.cc/300?img=1",

          reviewDescription: "I enjoyed the service but it could be better.",
          stars: 4,
          date: "2023-08-14",
        },
        {
          userName: "Alice Johnson",
          userImage: "https://i.pravatar.cc/300?img=0",

          reviewDescription: "Not what I expected, but it has potential.",
          stars: 3,
          date: "2023-08-13",
        },
        {
            userName: "John Doe",
            userImage: "https://i.pravatar.cc/300?img=5",

            reviewDescription: "This is an awesome product. I loved it!",
            stars: 5,
            date: "2023-08-15",
          },
          {
            userName: "Jane Smith",
            userImage: "https://i.pravatar.cc/300?img=6",

            reviewDescription: "I enjoyed the service but it could be better.",
            stars: 4,
            date: "2023-08-14",
          },
          {
            userName: "Alice Johnson",
            userImage: "https://i.pravatar.cc/300",

            reviewDescription: "Not what I expected, but it has potential.",
            stars: 3,
            date: "2023-08-13",
          },
      ];

    let UnitName = "Unit 405, Earthbag Village"
  
  return (
    <div className="payment-page">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>

      {/* Outer card container */}
      <div className="bid-container">
        {/* Green header bar */}
        <div className="header"></div>

        {/* Inner content area */}
        <div className="payment-container">
          {/* Gray form container */}
          <div className="form-container">
            <div className="map-link-container">
              <span>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "red" }} />{" "}
                <a href="#" className="property-map-link">
                  View on Property Map
                </a>
              </span>
            </div>
            <h1>{UnitName}</h1>

            <div className="show-reviews">
                <div className="img-container">
                    <img src={sampleUnit} alt="" />
                </div>
                <div className="reviews-container">
  
      {testReviews.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
                </div>
                 </div>
           

            <div className="back-link">
              <a href="">{'<<'} Back to reviews</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowReviews;
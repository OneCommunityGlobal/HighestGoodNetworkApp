
import React, { useState, useRef } from "react";
import styles from "./reviewForm.module.css";
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
    <div className={styles['payment-page']}>
      <div className={styles['logo-container']}>
        <img src={logo} alt="One Community Logo" />
      </div>

      {/* Outer card container */}
      <div className={styles['bid-container']}>
        {/* Green header bar */}
        <div className={styles.header}></div>

        {/* Inner content area */}
        <div className={styles['payment-container']}>
          {/* Gray form container */}
          <div className={styles['form-container']}>
            <div className={styles['map-link-container']}>
              <span>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "red" }} />{" "}
                <a href="#" className={styles['property-map-link']}>
                  View on Property Map
                </a>
              </span>
            </div>
            <h1>{UnitName}</h1>

            <div className={styles['show-reviews']}>
                <div className={styles['img-container']}>
                    <img src={sampleUnit} alt="" />
                </div>
                <div className={styles['reviews-container']}>
  
      {testReviews.map((review, index) => (
        <ReviewCard key={index} {...review} />
      ))}
                </div>
                 </div>
           

            <div className={styles['back-link']}>
              <a href="">{'<<'} Back to reviews</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowReviews;
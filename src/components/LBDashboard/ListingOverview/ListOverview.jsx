import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Listoverview.css';
import Carousel from 'react-bootstrap/Carousel';
import logo from '../../../assets/images/logo2.png';
import mapIcon from '../../../assets/images/mapIcon.png';
import ListingAvailability from './ListingAvailability';
import {ENDPOINTS} from '../../../utils/URL';
import httpService from '../../../services/httpService';


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ensureAuthentication = () => {
  const token = localStorage.getItem('token');
  if (token) {
    httpService.setjwt(token);
  }
};

function ListOverview() {
  const [listing, setListing] = useState({});
  const [showAvailability, setShowAvailability] = useState(false);
  const query = useQuery();
  const listingId = query.get('id');


  const fetchListing = async () => {
    try {

      ensureAuthentication();
      const response = await fetch(ENDPOINTS.LB_LISTING_GET_BY_ID, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: listingId }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
    }
  }
  useEffect(() => {
    if (listing) {
      fetchListing();
    }
  }, [listingId]);

  return (
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="content-container">
        <div className="container-top" />
        <div className="container-main">
          <div className="details-left">
            <div className="listing-details mobile-display">
              <h1>{listing.title}</h1>
            </div>
            <div className="image-carousel">
              <Carousel>
                {listing.images?.map((image, index) => (
                  <Carousel.Item key={image}>
                    <img className="d-block w-100" src={image} alt={`Slide ${index + 1}`} />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>

            <div className="amenities">
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol className="amenities-list">
                  {listing.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol className="amenities-list">
                  {listing.villageAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="location">
              <img src={mapIcon} alt="Map Icon" />
              <a href="/">{listing.location}</a>
            </div>
          </div>
          <div className="details-right">
            <div className="listing-details">
              <h1 className="desktop-display">{listing.title}</h1>
              <p>{listing.description}</p>
            </div>
            <div className="rent-form">
              <label htmlFor="from">
                Rent from
                <input type="date" name="from" id="from" />
              </label>
              <label htmlFor="to">
                Rent to
                <input type="date" name="to" id="to" />
              </label>
              <button type="button">Proceed to submit with details</button>
            </div>
            <div className="error-message">
              <h6>The Dates you picked are not available</h6>
              <a href="#" onClick={e => { e.preventDefault(); setShowAvailability(true); }}>Click here to see available dates</a>
            </div>
            {showAvailability && (
              <ListingAvailability
                listingId={listing._id || 'YOUR_LISTING_ID'}
                userId={'YOUR_USER_ID'}
                onClose={() => setShowAvailability(false)}
              />
            )}
            <div className="chat-host">
              <button type="button">
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/material-outlined/24/chat.png"
                  alt="chat"
                />
                Chat with the Host
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListOverview;

import React, { useEffect } from 'react';
import './Listoverview.css';
import logo from '../../../assets/images/logo2.png';
import mapIcon from '../../../assets/images/mapIcon.png';
import ImageCarousel from './ImageCarousel';

function ListOverview() {
  const [listing, setListing] = React.useState({});

  const data = {
    title: 'Title',
    images: [
      'https://nikonrumors.com/wp-content/uploads/2014/03/Nikon-1-V3-sample-photo.jpg',
      'https://photographylife.com/wp-content/uploads/2023/05/Nikon-Z8-Official-Samples-00002.jpg',
    ],
    description:
      'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam vitae, ex officiis iusto, quos eveniet consequatur minima nesciunt, doloremque cupiditate totam at quia asperiores rem reprehenderit explicabo perferendis aliquam tempora!',
    unitAmenities: ['Amenity x', 'Amenity y'],
    villageAmenities: ['Amenity c', 'Amenity v'],
    location: 'Location',
  };

  useEffect(() => {
    setListing(data);
  }, []);

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
              <ImageCarousel images={listing.images} />
            </div>
            <div className="amenities">
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol>
                  {listing.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol>
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
              <h1 className='desktop-display'>{listing.title}</h1>
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
              <a href="/">Click here to see available dates</a>
            </div>
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

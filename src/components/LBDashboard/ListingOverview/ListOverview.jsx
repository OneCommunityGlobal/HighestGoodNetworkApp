import React, { useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import logo from '../../../assets/images/logo2.png';
import mapIcon from '../../../assets/images/mapIcon.png';
import styles from './Listoverview.module.css';

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
    <div className={`${styles.mainContainer}`}>
      <div className={`${styles.logoContainer}`}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={`${styles.contentContainer}`}>
        <div className={`${styles.containerTop}`} />
        <div className={`${styles.containerMain}`}>
          <div className={`${styles.detailsLeft}`}>
            <div className={`${styles.listingDetails} ${styles.mobileDisplay}`}>
              <h1>{listing.title}</h1>
            </div>
            <div className={`${styles.imageCarousel}`}>
              <Carousel>
                {listing.images?.map((image, index) => (
                  <Carousel.Item key={image}>
                    <img className="d-block w-100" src={image} alt={`Slide ${index + 1}`} />
                  </Carousel.Item>
                ))}
              </Carousel>
            </div>

            <div className={`${styles.amenities}`}>
              <div>
                <h2>Available amenities in this unit:</h2>
                <ol className={`${styles.amenitiesList}`}>
                  {listing.unitAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
              <div>
                <h2>Village level amenities:</h2>
                <ol className={`${styles.amenitiesList}`}>
                  {listing.villageAmenities?.map(amenity => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className={`${styles.location}`}>
              <img src={mapIcon} alt="Map Icon" />
              <a href="/">{listing.location}</a>
            </div>
          </div>
          <div className={`${styles.detailsRight}`}>
            <div className={`${styles.listingDetails}`}>
              <h1 className={`${styles.desktopDisplay}`}>{listing.title}</h1>
              <p>{listing.description}</p>
            </div>
            <div className={`${styles.rentForm}`}>
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
            <div className={`${styles.chatHost}`}>
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

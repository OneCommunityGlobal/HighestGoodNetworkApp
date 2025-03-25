import './WishList.css';
import { connect } from 'react-redux';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import Header from '../Header';

function WishList() {
  // const [wishlistId, setWishlistId] = useState('');

  const wishlists = [
    {
      id: '1',
      title: 'Earthbag Village',
      unit: 'Unit 405',
      images: [
        'https://picsum.photos/700/400?random=1',
        'https://picsum.photos/700/400?random=2',
        'https://picsum.photos/700/400?random=3',
      ],
      unitAmenities: [
        'Artistic Interiors',
        'Private Rainwater Collection',
        'Solar-Powered Lighting and Charging',
      ],
      villageAmenities: [
        'Central Tropical Atrium',
        'Eco-Showers and Toilets',
        'Solar Power infrastructure',
        'Passive Heating and Cooling',
        'Rainwater Harvesting Systems',
        'Workshops and Demonstration Spaces',
      ],
      location: 'Location',
      price: '$28/Day',
    },
    {
      id: '2',
      title: 'Cob Village',
      unit: 'Unit 105',
      images: [
        'https://picsum.photos/700/400?random=5',
        'https://picsum.photos/700/400?random=6',
        'https://picsum.photos/700/400?random=7',
      ],
      unitAmenities: ['Solar powered infrastructure', 'Sustainably developed decorations'],
      villageAmenities: [
        'Passive Heating and Cooling',
        'Rainwater Harvesting Systems',
        'Workshops and Demonstration Spaces',
      ],
      location: 'Location',
      price: '$25/Day',
    },
    {
      id: '3',
      title: 'Rob Village',
      unit: 'Unit 205',
      images: [
        'https://picsum.photos/700/400?random=8',
        'https://picsum.photos/700/400?random=9',
        'https://picsum.photos/700/400?random=10',
      ],
      unitAmenities: [
        'Artistic Interiors',
        'Private Rainwater Collection',
        'Sustainably developed decorations',
      ],
      villageAmenities: [
        'Central Tropical Atrium',
        'Eco-Showers and Toilets',
        'Passive Heating and Cooling',
        'Rainwater Harvesting Systems',
        'Workshops and Demonstration Spaces',
      ],
      location: 'Location',
      price: '$50/Day',
    },
  ];
  return (
    <div className="item">
      <div className="item__container">
        <Header />
        <div className="item__location list__location">
          <FaMapMarkerAlt className="item__icon" />
          <a href="/">View on Property Map</a>
        </div>
        <h1 className="list__title">Wish List</h1>
        {wishlists?.map(item => (
          <div className="item__body" key={item.id}>
            <div className="item__details-wrapper">
              <div className="list__details-left">
                <img
                  key={item.images[0]}
                  className="carousel-image"
                  src={item.images[0]}
                  alt="House"
                />
              </div>
              <div className="list__details-right">
                <div className="item-title_wrapper">
                  <span className="list__item-title item-title-right">{item.title}</span>
                </div>
                <div className="item__details">
                  <span className="list__item-title">{item.unit}</span>
                  <div className="list_item__amenities">
                    <div>
                      <span className="font600">Available amenities in this unit:</span>
                      <ol>
                        {item.unitAmenities?.map(amenity => (
                          <li key={amenity}>{amenity}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="item__price">
                  <span className="font600">Basic per night price:</span> {item.price}
                </div>
                <div>
                  <NavItem
                    tag={Link}
                    to={`/lbdashboard/wishlist/${item.id}`}
                    className="list__details"
                  >
                    Click here to view availabilities
                  </NavItem>
                </div>
              </div>
            </div>
            <div className="item__footer">
              <a href="/" className="list__link">
                Click for list overview
              </a>
              <div className="wishlist__start__chat">
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
        ))}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

export default connect(mapStateToProps)(WishList);

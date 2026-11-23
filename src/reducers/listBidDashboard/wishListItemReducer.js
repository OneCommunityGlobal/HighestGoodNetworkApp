const SET_CURRENT_WISHLIST_ITEM = 'SET_CURRENT_WISHLIST_ITEM';

export const setCurrentWishListItem = item => ({
  type: SET_CURRENT_WISHLIST_ITEM,
  payload: item,
});

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
    host: {
      userId: '507f1f77bcf86cd799439011',
      firstName: 'Earthbag',
      lastName: 'Host',
      profilePic: '',
    },
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
    host: {
      userId: '507f1f77bcf86cd799439012',
      firstName: 'Cob Village',
      lastName: 'Host',
      profilePic: '',
    },
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
    host: {
      userId: '507f1f77bcf86cd799439013',
      firstName: 'Rob Village',
      lastName: 'Host',
      profilePic: '',
    },
  },
];

const initialState = {
  wishListItem: null,
  wishlists,
};

/* eslint-disable default-param-last */
const wishListReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_WISHLIST_ITEM:
      return { ...state, wishListItem: action.payload };
    default:
      return state;
  }
};
/* eslint-disable default-param-last */

export default wishListReducer;

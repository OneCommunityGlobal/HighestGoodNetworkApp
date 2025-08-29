import {
  FETCH_USER_WISHLIST_REQUEST,
  FETCH_USER_WISHLIST_SUCCESS,
  FETCH_USER_WISHLIST_FAILURE,
  ADD_TO_WISHLIST_REQUEST,
  ADD_TO_WISHLIST_SUCCESS,
  ADD_TO_WISHLIST_FAILURE,
  REMOVE_FROM_WISHLIST_REQUEST,
  REMOVE_FROM_WISHLIST_SUCCESS,
  REMOVE_FROM_WISHLIST_FAILURE,
} from '../../constants/lbdashboard/wishlistConstants';

const initialState = {
  wishList: [],
  wishListItem: null,
  loading: false,
  error: null,
};

const wishListReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_WISHLIST_REQUEST:
    case ADD_TO_WISHLIST_REQUEST:
    case REMOVE_FROM_WISHLIST_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_USER_WISHLIST_SUCCESS:
      return { ...state, loading: false, wishList: action.payload };

    case ADD_TO_WISHLIST_SUCCESS:
      return { ...state, loading: false, wishList: [...state.wishList, action.payload] };

    case REMOVE_FROM_WISHLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        wishList: state.wishList.filter(item => item.id !== action.payload.id),
      };

    case FETCH_USER_WISHLIST_FAILURE:
    case ADD_TO_WISHLIST_FAILURE:
    case REMOVE_FROM_WISHLIST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case 'SET_CURRENT_WISHLIST_ITEM':
      return { ...state, wishListItem: action.payload };

    default:
      return state;
  }
};

export default wishListReducer;

// const SET_CURRENT_WISHLIST_ITEM = 'SET_CURRENT_WISHLIST_ITEM';

// export const setCurrentWishListItem = item => ({
//   type: SET_CURRENT_WISHLIST_ITEM,
//   payload: item,
// });

// const wishlists = [
//   {
//     id: '1',
//     title: 'Earthbag Village',
//     unit: 'Unit 405',
//     images: [
//       'https://picsum.photos/700/400?random=1',
//       'https://picsum.photos/700/400?random=2',
//       'https://picsum.photos/700/400?random=3',
//     ],
//     unitAmenities: [
//       'Artistic Interiors',
//       'Private Rainwater Collection',
//       'Solar-Powered Lighting and Charging',
//     ],
//     villageAmenities: [
//       'Central Tropical Atrium',
//       'Eco-Showers and Toilets',
//       'Solar Power infrastructure',
//       'Passive Heating and Cooling',
//       'Rainwater Harvesting Systems',
//       'Workshops and Demonstration Spaces',
//     ],
//     location: 'Location',
//     price: '$28/Day',
//   },
//   {
//     id: '2',
//     title: 'Cob Village',
//     unit: 'Unit 105',
//     images: [
//       'https://picsum.photos/700/400?random=5',
//       'https://picsum.photos/700/400?random=6',
//       'https://picsum.photos/700/400?random=7',
//     ],
//     unitAmenities: ['Solar powered infrastructure', 'Sustainably developed decorations'],
//     villageAmenities: [
//       'Passive Heating and Cooling',
//       'Rainwater Harvesting Systems',
//       'Workshops and Demonstration Spaces',
//     ],
//     location: 'Location',
//     price: '$25/Day',
//   },
//   {
//     id: '3',
//     title: 'Rob Village',
//     unit: 'Unit 205',
//     images: [
//       'https://picsum.photos/700/400?random=8',
//       'https://picsum.photos/700/400?random=9',
//       'https://picsum.photos/700/400?random=10',
//     ],
//     unitAmenities: [
//       'Artistic Interiors',
//       'Private Rainwater Collection',
//       'Sustainably developed decorations',
//     ],
//     villageAmenities: [
//       'Central Tropical Atrium',
//       'Eco-Showers and Toilets',
//       'Passive Heating and Cooling',
//       'Rainwater Harvesting Systems',
//       'Workshops and Demonstration Spaces',
//     ],
//     location: 'Location',
//     price: '$50/Day',
//   },
// ];

// const initialState = {
//   wishListItem: null,
//   wishlists,
// };

// /* eslint-disable default-param-last */
// const wishListReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case SET_CURRENT_WISHLIST_ITEM:
//       return { ...state, wishListItem: action.payload };
//     default:
//       return state;
//   }
// };
// /* eslint-disable default-param-last */

// export default wishListReducer;

import { ENDPOINTS } from '~/utils/URL';
import httpService from '../../../services/httpService';

const API_BASE_URL = ENDPOINTS.LB_LISTINGS_BASE;

export const FIXED_VILLAGES = [
  'Earthbag',
  'Straw Bale',
  'Recycle Materials',
  'Cob',
  'Tree House',
  'Strawberry',
  'Sustainable Living',
  'City Center',
];

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=Unit';

/**
 * Transform API listing to match the frontend data format
 * @param {Object} apiListing - Listing data from the API
 * @returns {Object} Transformed listing object
 */
export const transformApiListing = apiListing => {
  return {
    id: apiListing._id,
    title: apiListing.title,
    village: apiListing.village || 'Unknown Village',
    price: apiListing.price || 0,
    perUnit: apiListing.perUnit || 'day',
    images: apiListing.images && apiListing.images.length ? apiListing.images : [DEFAULT_IMAGE],
    availableFrom: apiListing.availableFrom ? new Date(apiListing.availableFrom) : new Date(),
    availableTo: apiListing.availableTo
      ? new Date(apiListing.availableTo)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    coordinates: apiListing.coordinates || [37.7749, -122.4194],
    description:
      apiListing.description ||
      `This is a ${apiListing.village || 'Unknown'} style unit available for rent.`,
    amenities: apiListing.amenities || [],
    createdBy: apiListing.createdBy?._id,
    updatedBy: apiListing.updatedBy?._id,
    status: apiListing.status || 'draft',
  };
};

const ensureAuthentication = () => {
  const token = localStorage.getItem('token');
  if (token) {
    httpService.setjwt(token);
  }
};

/**
 * Redirect to login page if authentication error occurs
 */
const redirectToLoginIfNeeded = () => {
  const currentPath = window.location.pathname;
  if (!currentPath.includes('login')) {
    // console.log('Authentication error, redirecting to login');
    // Uncomment to actually redirect
    // window.location.href = '/login?redirect=' + encodeURIComponent(currentPath);
  }
};

/**
 * Fetch all available villages from the backend
 * @returns {Promise<Array>} Array of village names
 */
export const fetchVillages = async () => {
  try {
    ensureAuthentication();

    const response = await httpService.get(`${API_BASE_URL}/villages`);

    const apiVillages = response.data.data || [];

    const allVillages = [...new Set([...FIXED_VILLAGES, ...apiVillages])];

    return allVillages.sort();
  } catch (error) {
    // console.error('Error fetching villages:', error);

    if (error.response && error.response.status === 401) {
      redirectToLoginIfNeeded();
    }

    return [...FIXED_VILLAGES];
  }
};

/**
 * Fetch listings with optional filters
 * @param {number} page - Page number (1-based)
 * @param {number} size - Page size
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Listings data with pagination info
 */
export const fetchListings = async (page = 1, size = 12, filters = {}) => {
  try {
    ensureAuthentication();

    const params = new URLSearchParams({
      page,
      size,
    });

    if (filters.village) params.append('village', filters.village);
    if (filters.availableFrom) params.append('availableFrom', filters.availableFrom);
    if (filters.availableTo) params.append('availableTo', filters.availableTo);

    const response = await httpService.get(`${API_BASE_URL}/listing?${params.toString()}`);

    const responseData = response.data;
    const items = responseData.data?.items || responseData.items || [];
    const pagination = responseData.data?.pagination ||
      responseData.pagination || {
        total: items.length,
        totalPages: Math.ceil(items.length / size),
        currentPage: page,
        pageSize: size,
      };

    const transformedItems = items.map(transformApiListing);

    return {
      items: transformedItems,
      pagination,
    };
  } catch (error) {
    // console.error('Error fetching listings:', error);

    if (error.response && error.response.status === 401) {
      redirectToLoginIfNeeded();
    }

    return {
      items: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: size,
      },
    };
  }
};

/**
 * Fetch biddings with optional filters
 * @param {number} page - Page number (1-based)
 * @param {number} size - Page size
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Biddings data with pagination info
 */
export const fetchBiddings = async (page = 1, size = 12, filters = {}) => {
  try {
    ensureAuthentication();

    const params = new URLSearchParams({
      page,
      size,
    });

    if (filters.village) params.append('village', filters.village);
    if (filters.availableFrom) params.append('availableFrom', filters.availableFrom);
    if (filters.availableTo) params.append('availableTo', filters.availableTo);

    const response = await httpService.get(`${API_BASE_URL}/biddings?${params.toString()}`);

    const responseData = response.data;
    const items = responseData.data?.items || responseData.items || [];
    const pagination = responseData.data?.pagination ||
      responseData.pagination || {
        total: items.length,
        totalPages: Math.ceil(items.length / size),
        currentPage: page,
        pageSize: size,
      };

    const transformedItems = items.map(item => {
      const transformedItem = transformApiListing(item);
      return {
        ...transformedItem,
        isBidding: true,
      };
    });

    return {
      items: transformedItems,
      pagination,
    };
  } catch (error) {
    // console.error('Error fetching biddings:', error);

    if (error.response && error.response.status === 401) {
      redirectToLoginIfNeeded();
    }

    return {
      items: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage: page,
        pageSize: size,
      },
    };
  }
};

/**
 * Create a new listing
 * @param {Object} listingData - Listing data
 * @param {File[]} images - Image files to upload
 * @returns {Promise<Object>} Created listing data
 */
export const createListing = async (listingData, images) => {
  try {
    ensureAuthentication();

    const formData = new FormData();

    Object.keys(listingData).forEach(key => {
      if (key === 'coordinates' && Array.isArray(listingData[key])) {
        formData.append(key, JSON.stringify(listingData[key]));
      } else if (key === 'amenities' && Array.isArray(listingData[key])) {
        listingData[key].forEach(amenity => {
          formData.append('amenities', amenity);
        });
      } else {
        formData.append(key, listingData[key]);
      }
    });

    if (images && images.length) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await httpService.post(`${API_BASE_URL}/listings`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return transformApiListing(response.data.data);
  } catch (error) {
    // console.error('Error creating listing:', error);

    if (error.response && error.response.status === 401) {
      redirectToLoginIfNeeded();
    }

    throw error;
  }
};

export default {
  fetchListings,
  fetchBiddings,
  createListing,
  fetchVillages,
  FIXED_VILLAGES,
};

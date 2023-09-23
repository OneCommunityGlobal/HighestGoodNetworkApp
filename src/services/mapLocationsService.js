import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const APIEndPoint = `${ApiEndpoint}/mapLocations`;

export const removeLocation = locationId => httpService.delete(`${APIEndPoint}/${locationId}`);
export const createLocation = locationData => httpService.put(`${APIEndPoint}/`, locationData);

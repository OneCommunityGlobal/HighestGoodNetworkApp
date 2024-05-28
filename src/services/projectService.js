import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const ApiUri = `${ApiEndpoint}/projects`;

const getAllProjects = () => httpService.get(`${ApiUri}`);
export default getAllProjects;

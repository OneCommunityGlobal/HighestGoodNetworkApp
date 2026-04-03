import httpService from './httpService';
import { ApiEndpoint } from '~/utils/URL';

const ApiUri = `${ApiEndpoint}/tools/availability`;

const getToolsAvailability = ({ projectId, startDate, endDate }) =>
  httpService.get(ApiUri, {
    params: {
      projectId,
      startDate,
      endDate,
    },
  });

export default getToolsAvailability;

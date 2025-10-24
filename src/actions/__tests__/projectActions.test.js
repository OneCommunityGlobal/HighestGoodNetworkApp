import axios from 'axios';
import { getProjectDetail, setProjectDetail } from '../project';
import { ENDPOINTS } from '../../utils/URL';
import { GET_PROJECT_BY_ID } from '../../constants/project';

jest.mock('axios');

describe('getProjectDetail action creator', () => {
  const mockDispatch = jest.fn();
  const projectId = '12345';
  const mockProjectData = { id: projectId, name: 'Test Project' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should dispatch setProjectDetail when API call is successful', async () => {
    axios.get.mockResolvedValueOnce({ data: mockProjectData });
    const url = ENDPOINTS.PROJECT_BY_ID(projectId);

    await getProjectDetail(projectId)(mockDispatch);

    expect(axios.get).toHaveBeenCalledWith(url);
    expect(mockDispatch).toHaveBeenCalledWith(setProjectDetail(mockProjectData));
  });

  it('should not dispatch setProjectDetail when API call returns 401', async () => {
    axios.get.mockRejectedValueOnce({ status: 401 });
    const url = ENDPOINTS.PROJECT_BY_ID(projectId);

    await getProjectDetail(projectId)(mockDispatch);

    expect(axios.get).toHaveBeenCalledWith(url);
    expect(mockDispatch).not.toHaveBeenCalledWith(setProjectDetail(mockProjectData));
  });

  it('should handle other errors', async () => {
    axios.get.mockRejectedValueOnce({ status: undefined });
    const url = ENDPOINTS.PROJECT_BY_ID(projectId);
    await getProjectDetail(projectId)(mockDispatch);
    expect(axios.get).toHaveBeenCalledWith(url);
    expect(mockDispatch).not.toHaveBeenCalledWith(setProjectDetail(mockProjectData));
  });
});

describe('setProjectDetail action creator', () => {
  const mockProjectData = { id: '12345', name: 'Test Project' };

  it('should create the correct action', () => {
    const action = setProjectDetail(mockProjectData);

    expect(action).toEqual({
      type: GET_PROJECT_BY_ID,
      payload: mockProjectData,
    });
  });
});

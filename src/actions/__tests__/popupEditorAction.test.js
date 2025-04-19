import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import * as actions from '../popupEditorAction';
import * as types from '../../constants/popupEditorConstants';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Popup Editor Actions', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  it('should dispatch RECEIVE_POPUP on successful fetchAllPopupEditor', async () => {
    const mockData = [{ id: 1, popupContent: 'Test Content', popupName: 'Test Popup' }];
    axios.get.mockResolvedValue({ data: mockData });

    await store.dispatch(actions.fetchAllPopupEditor());

    expect(store.getActions()).toEqual([
      { type: types.RECEIVE_POPUP, popupItems: mockData },
    ]);
  });

 

  it('should dispatch RECEIVE_POPUP on successful updatePopupEditor', async () => {
    const popupId = 1;
    const popupContent = 'Updated Content';
    const popupName = 'Updated Name';
    const mockData = [{ id: popupId, popupContent, popupName }];

    axios.post.mockResolvedValue({});
    axios.get.mockResolvedValue({ data: mockData });

    await store.dispatch(actions.updatePopupEditor(popupId, popupContent, popupName));

    expect(store.getActions()).toEqual([
      { type: types.RECEIVE_POPUP, popupItems: mockData },
    ]);
  });

  it('should dispatch CURRENT_POPUP on successful getPopupById', async () => {
    const popupId = 1;
    const mockData = { id: popupId, popupContent: 'Test', popupName: 'Popup' };
    axios.get.mockResolvedValue({ data: mockData });

    await store.dispatch(actions.getPopupById(popupId));

    expect(store.getActions()).toEqual([
      { type: types.CURRENT_POPUP, currPopup: mockData },
    ]);
  });

  it('should dispatch FETCH_POPUP_ERROR on failed getPopupById', async () => {
    axios.get.mockRejectedValue(new Error('Fetch error'));
    await store.dispatch(actions.getPopupById(1));
    expect(store.getActions()).toEqual([
      { type: types.FETCH_POPUP_ERROR, err: undefined },
    ]);
  });
});

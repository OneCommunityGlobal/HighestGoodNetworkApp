import { badgeReducer } from '../badgeReducer';
import * as types from '../../constants/badge';

describe('Badge Reducer', () => {
  it('get all data', () => {
    const result = badgeReducer(
      {},
      {
        type: types.GET_ALL_BADGE_DATA,
        allBadges: 'X 0 X',
      },
    );
    expect(result).toMatchObject({
      allBadgeData: 'X 0 X',
    });
  });

  it('add select', () => {
    const result = badgeReducer(
      {
        selectedBadges: [0],
      },
      {
        type: types.ADD_SELECT_BADGE,
        badgeId: 1,
      },
    );
    expect(result).toMatchObject({
      selectedBadges: [0, 1],
    });
  });

  it('remove select', () => {
    const result = badgeReducer(
      {
        selectedBadges: [0, 42, 1],
      },
      {
        type: types.REMOVE_SELECT_BADGE,
        badgeId: 42,
      },
    );
    expect(result).toMatchObject({
      selectedBadges: [0, 1],
    });
  });

  it('clear name & selected', () => {
    const result = badgeReducer(
      {
        selectedBadges: [1, 2],
        firstName: 'neo',
        lastName: 'one',
      },
      {
        type: types.CLEAR_NAME_AND_SELECTED,
      },
    );
    expect(result).toMatchObject({
      selectedBadges: [],
      firstName: '',
      lastName: '',
    });
  });

  it('get first name', () => {
    const result = badgeReducer(
      {},
      {
        type: types.GET_FIRST_NAME,
        firstName: 'neo',
      },
    );
    expect(result).toMatchObject({
      firstName: 'neo',
    });
  });

  it('get last name', () => {
    const result = badgeReducer(
      {},
      {
        type: types.GET_LAST_NAME,
        lastName: 'one',
      },
    );
    expect(result).toMatchObject({
      lastName: 'one',
    });
  });

  it('get msg', () => {
    const result = badgeReducer(
      {},
      {
        type: types.GET_MESSAGE,
        message: 'msg',
        color: 'green',
      },
    );
    expect(result).toMatchObject({
      message: 'msg',
      alertVisible: true,
      color: 'green',
    });
  });

  it('close alert', () => {
    const result = badgeReducer(
      {},
      {
        type: types.CLOSE_ALERT,
      },
    );
    expect(result).toMatchObject({
      alertVisible: false,
    });
  });
});

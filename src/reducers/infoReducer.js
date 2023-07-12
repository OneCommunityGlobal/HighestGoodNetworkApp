// reducers/editagbleInfoReducer.js
import * as types from '../constants/info';
const initialInfo = {
  infos: [],
};

export const infoReducer = (state = initialInfo, action) => {
  switch (action.type) {
    case types.RECEIVE_INFOS:
      return { ...state};

    case types.ADD_NEW_INFO:
      const toAdd = state.infos;
      toAdd.push(action.payload);
      return { ...state, infos: toAdd };

    case types.UPDATE_INFO:
      const infoUpdated = action.payload;
      const indexInfoUpdated = state.infos.findIndex(info => info._id === infoUpdated.infoId);
      const infosCopy = state.infos;

      if (infoUpdated.areaName !== infosCopy[indexInfoUpdated].areaName) {
        infosCopy[indexInfoUpdated].areaName = infoUpdated.areaName;
      }

      infosCopy[indexInfoUpdated].content= roleUpdated.content;
      return { ...state, infos: infosCopy };

    default:
      return state;
  }
};


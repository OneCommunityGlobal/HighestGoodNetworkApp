
import { shallow, mount } from 'enzyme';
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import thunk from 'redux-thunk';
import reducers from './../reducers';
import mockState from './mockAdminState.js'
import { createMemoryHistory } from 'history';

import { createStore, applyMiddleware, compose } from 'redux'
import Dashboard from '../components/Dashboard';
const middleware = [thunk];



let store = createStore(reducers, mockState, compose(applyMiddleware(...middleware)));

describe('Dashboard ', () => {
    let dashBoardMountedPage = renderWithProvider(<Dashboard />, {initialState: mockState, store: store});

    it('should match snapshot', async () =>  { 
     expect(dashBoardMountedPage.asFragment()).toMatchSnapshot();
   });
});
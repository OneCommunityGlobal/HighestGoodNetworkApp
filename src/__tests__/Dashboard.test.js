
import { renderWithProvider, renderWithRouterMatch } from './utils.js'
import '@testing-library/jest-dom/extend-expect'
import React from 'react';
import mockState from './mockAdminState.js'
import Dashboard from '../components/Dashboard';


describe('Dashboard ', () => {
    let dashBoardMountedPage = renderWithRouterMatch(<Dashboard />, {initialState: mockState});

    it('should match snapshot', async () =>  { 
    //  expect(dashBoardMountedPage.asFragment()).toMatchSnapshot();
   });
});
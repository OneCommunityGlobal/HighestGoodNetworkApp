import { render } from '@testing-library/react';
import React from 'react';
import reducers from './../../reducers';
import { createMemoryHistory } from 'history';
import '@testing-library/jest-dom/extend-expect';

// import { renderWithProvider, renderWithRouterMatch } from './../../__tests__/utils.js'
// import '@testing-library/jest-dom/extend-expect'
// import thunk from 'redux-thunk';
// import { createStore, applyMiddleware, compose } from 'redux'
// import mockState from './../../__tests__/mockAdminState.js'
// const middleware = [thunk];
// let store = createStore(reducers, mockState, compose(applyMiddleware(...middleware)));

//mock the child components to test that they are indeed there

jest.mock('../LeaderBoard', () => () => <div data-testid="leaderboard"></div>);

jest.mock('../WeeklySummary/WeeklySummaryModal', () => () => (
  <div data-testid="weeklysummary"></div>
));

// jest.mock('../MonthlyEffort', () => () =>
//             <div data-testid="monthlyeffort">
//             </div>
//     );

import { Dashboard } from './Dashboard.jsx';

//DASHBOARD NEEDS TO BE EXPORTED ALSO YOU NEED TO SEND IN THE PROPER PROPS IF YOUR GOING TO NOT HAVE THE ROUTER
// describe('Dashboard component tests', () => {
//     let dashBoardMountedPage
//    beforeEach(() => {
//     dashBoardMountedPage = render(<Dashboard />);
//     });

//   it('should render a leaderboard', async () => {
//     const leaderboard = await dashBoardMountedPage.queryByTestId('leaderboard');
//     expect(leaderboard).toBeTruthy();
//   });

//   it('should render a weekly summary', async () => {
//     const weeklySummary = await dashBoardMountedPage.queryByTestId('weeklysummary');
//     expect(weeklySummary).toBeTruthy();
//   });

// it('should render a monthly effort', async () => {
//   const monthlyEffort = await dashBoardMountedPage.queryByTestId('monthlyeffort');
//   expect(monthlyEffort).toBeTruthy();
// });

// });

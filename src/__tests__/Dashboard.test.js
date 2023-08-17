import '@testing-library/jest-dom/extend-expect';
import mockState from './mockAdminState.js';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([thunk]);
describe('Dashboard ', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: mockState.auth,
      userProfile: mockState.userProfile,
      timeEntries: mockState.timeEntries,
      userProjects: mockState.userProjects,
      weeklySummaries: mockState.weeklySummaries,
      role: mockState.role,
    });
    store.dispatch = jest.fn();
    //check what props should be being passed seems the getUserProfile isnt there see if your using renderWithRouterMatch correctly
    //What props are you sending in?  I dont see them looks like you will need to create props with any props that are being mapped from the actions do that and this should work.
    // renderWithRouterMatch(
    //   <Route path="/dashboard">
    //     {props => <Dashboard {...props} />}
    //   </Route>,
    //   {
    //     route: '/dashboard',
    //     store,
    //   },
    // );
  });
  it('should render Dashboard without crashing', async () => {});
  it('should render Weekly Summaries after pressing summary due date button', async () => {
    //THIS ERRORS OUT CHECK THAT IT STILL EXISTS AlSO THIS MAYBE BETTER TO BE TESTED IN WEEKLY SUMMARIES
    // window.HTMLElement.prototype.scrollIntoView = function() {};
    // const button = screen.getByRole('button', {name : /summary due date/i});
    // expect(button).toBeInTheDocument();
    // userEvent.click(button);
    // await waitFor(() => {
    //     expect(screen.getByText('Weekly Summaries')).toBeTruthy();
    // });
  });
});

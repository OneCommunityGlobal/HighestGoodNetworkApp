import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import AssignBadge from 'components/Badge/AssignBadge';
import Autosuggest from 'react-autosuggest';
import { Provider } from 'react-redux';

// Create a mock Redux store that doesn't actually update any state when actions are dispatched. Pass in array of middlewares. 'thunk' is a Redux middleware that performs asynchronous logic at a later time -- perfect for testing asynchronous function calls.
const mockStore = configureStore([thunk]);

// Mock badge data
const mockallBadgeData = [
  { _id: '1', badgeName: '30 HOURS 3-WEEK STREAK' },
  { _id: '2', badgeName: 'LEAD A TEAM OF 40+ (Trailblazer) ' },
  { _id: '3', badgeName: '40 HOURS 2-WEEK STREAK' },
  { _id: '4', badgeName: 'NO BLUE SQUARE FOR 3 MONTHS' },
  { _id: '5', badgeName: '2X MINIMUM HOURS' },
  { _id: '6', badgeName: 'Most Hours in A Week' },
];

const mockUserProfilesData = [
  {
    permissions: {
      frontPermissions: [
        'getWeeklySummaries',
        'seeUserManagement',
        'seeBadgeManagement',
        'addTask',
        'seeVisibilityIcon',
        'putUserProfileImportantInfo',
        'editTimelogDate'
      ],
      backPermissions: []
    },
    isActive: true,
    weeklycommittedHours: 50,
    createdDate: '2023-10-18T21:07:33.024Z',
    _id: '652ef81ccf71ca5032fa5acf',
    role: 'Volunteer',
    firstName: 'jerry',
    lastName: 'volunteer1',
    email: 'jerryvolunteer1@gmail.com'
  },
  {
    permissions: {
      frontPermissions: [
        'editTimeEntry',
        'toggleTangibleTime'
      ],
      backPermissions: []
    },
    isActive: true,
    weeklycommittedHours: 10,
    createdDate: '2023-08-23T19:22:13.124Z',
    _id: '64e65c659c3e2408c823aabb',
    role: 'Volunteer',
    firstName: 'jerry',
    lastName: 'volunteer2',
    email: 'jerryvolunteer2@gmail.com',
    reactivationDate: '2023-10-31T00:00:00.000Z'
  }
];

const renderComponent = () => {
  // Added mock data. Only mock the parts of Redux store that the component to be tested will directly update. In this case, firstName and lastName, and maybe allUserProfiles.userProfiles (but maybe never used).
  const store = mockStore({
    badge: {
      firstName: "",
      lastName: "",
    },
    allUserProfiles: {
      userProfiles: mockUserProfilesData,
    }
  });

  return render(
    <Provider store={store}>
      <AssignBadge 
        allBadgeData={mockallBadgeData}
      />
    </Provider>
  )  
};

describe('AssignBadge component', () => {
  it.skip('Renders without crashing', () => {
    renderComponent();
  });
  it.skip('Renders the Label element', () => {
    renderComponent();

    const searchInput = screen.getByText('Search by Name');
    expect(searchInput).toBeInTheDocument();
  });
  it('Render the first name input and last name input', async () => {
    renderComponent();
    const inputFirstNameElement = screen.getByPlaceholderText('first name');
    const inputLastNameElement = screen.getByPlaceholderText('last name');

    expect(inputFirstNameElement).toBeInTheDocument();
    expect(inputLastNameElement).toBeInTheDocument();
  });
  it.skip('Renders the suggestions', async () => {
    // Mock the necessary functions and state.
    const firstSuggestions = ["Jerry Admin", "Jerry Volunteer", "Jerry Owner"]; // Replace with mock data
    const onFirstSuggestionsFetchRequested = jest.fn();
    const onFirstSuggestionsClearRequested = jest.fn();
    const onFirstSuggestionSelected = jest.fn();
    const getSuggestionFirst = jest.fn();
    const renderSuggestion = jest.fn();
    const onFirstChange = jest.fn();

    const FirstInputProps = {
      placeholder: 'first name',
      value: "Jerry",
      onChange: onFirstChange,
      autoFocus: true,
    };

    // Render the AutoSuggest component
    render(
      <div style={{ marginRight: '5px' }} id='this-div'>
        <Autosuggest
          suggestions={firstSuggestions}
          onSuggestionsFetchRequested={onFirstSuggestionsFetchRequested}
          onSuggestionsClearRequested={onFirstSuggestionsClearRequested}
          onSuggestionSelected={onFirstSuggestionSelected}
          getSuggestionValue={getSuggestionFirst}
          renderSuggestion={renderSuggestion}
          inputProps={FirstInputProps}
          style={{ marginLeft: '5px', marginRight: '5px' }}
          aria-labelledby="searchByNameLabel"
        />
      </div>
    )

    const suggestionList = screen.getAllByRole('listbox');
    const optionList = screen.getAllByRole('option');

    // Assertions
    expect(suggestionList[1] instanceof HTMLUListElement).toBe(true);
    expect(optionList.length).toBe(3); // Assert that there are 3 options, as there are 3 items in array set to firstSuggestions.
  });
});
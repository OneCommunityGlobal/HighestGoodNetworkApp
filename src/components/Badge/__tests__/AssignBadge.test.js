import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
  import AssignBadge from 'components/Badge/AssignBadge';
import Autosuggest from 'react-autosuggest';
import { Provider } from 'react-redux';
import { badgeReducer } from 'reducers/badgeReducer';
import { GET_FIRST_NAME, GET_LAST_NAME } from 'constants/badge';

const mockStore = configureStore([thunk]);

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
        'seeUserManagement'
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

const store = mockStore({
  badge: {
    firstName: "",
    lastName: "",
  },
  allUserProfiles: {
    userProfiles: mockUserProfilesData,
  }
});

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <AssignBadge 
        allBadgeData={mockallBadgeData}
      />
    </Provider>
  )  
};

describe('AssignBadge component', () => {
  it('Renders without crashing', () => {
    renderComponent();
  });
  it('Renders the Label element', () => {
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
  it('Renders the suggestions', async () => {
    const firstSuggestions = ["Jerry Admin", "Jerry Volunteer", "Jerry Owner"];
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

    expect(suggestionList[1] instanceof HTMLUListElement).toBe(true);
    expect(optionList.length).toBe(3);
  });
  it('Manually apply reducer to mock store and dispatched action', () => {
    const initialState = {
      firstName: "",
      lastName: "",
    }
    let newState = badgeReducer(initialState, { type: GET_FIRST_NAME, firstName: "NewFirstName" })
    newState = badgeReducer(newState, { type: GET_LAST_NAME, lastName: "NewLastName" })

    expect(newState.firstName).toEqual("NewFirstName");
    expect(newState.lastName).toEqual("NewLastName");
  });
  it('Render the Assign Badge button', () => {
    renderComponent();

    const buttonElement = screen.getByText('Assign Badge')
    expect(buttonElement).toBeInTheDocument();
  });
  it('Render the tool tip hover message', async () => {
    renderComponent();

    const tooltip = screen.getByTestId('NameInfo');
    fireEvent.mouseEnter(tooltip);

    const tip1 = "Really, you're not sure what \"name\" means? Start typing a first or last name and a list of the active members (matching what you type) will be auto generated. Then you........ CHOOSE ONE!"
    const tip2 = "Yep, that's it. Next you click \"Assign Badge\" and.... choose one or multiple badges! Click \"confirm\" then \"submit\" and those badges will show up as part of that person's earned badges. You can even assign a person multiple of the same badge(s) by repeating this process and choosing the same badge as many times as you want them to earn it."
    const message1 = await screen.findByText(tip1);
    const message2 = await screen.findByText(tip2);
    expect(message1).toBeInTheDocument();
    expect(message2).toBeInTheDocument();
  });
  it('Dispatches action when badges are assigned', async () => {
    renderComponent();

    const numOfBadges = screen.getByText("0 badges selected");
    expect(numOfBadges).toBeInTheDocument();

    const buttonElement = screen.getByText('Assign Badge')
    expect(buttonElement).toBeInTheDocument();
    fireEvent.click(buttonElement)

    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'GET_MESSAGE'
        })
      ])
    )
  });
});
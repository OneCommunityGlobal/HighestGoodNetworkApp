import React from 'react';
import EditBadgePopup from '../EditBadgePopup';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';

//mock redux store
jest.mock('react-redux', () => ({
  connect: () => component => component,
}));

//mock props
const mockBadgeValues = {
  badgeName: 'Test Name',
  category: 'Test Category',
  description: 'Test Description',
  imageUrl: 'Test Link',
  months: 0,
  multiple: 0,
  people: 0,
  project: null,
  ranking: 1,
  showReport: false,
  totalHrs: 0,
  type: 'Test Type',
  weeks: 0,
  _id: 'Test Id',
};

describe('EditBadgePopup Component', () => {
  test('renders the entire component properly', () => {
    render(<EditBadgePopup open={true} />);

    //test for rendering all the core components
    expect(screen.getByText('Edit Badge')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Image URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Ranking')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('shows the data correctly', () => {
    mockBadgeValues.type = 'Custom';
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);

    const nameField = screen.getByLabelText('Name');
    const imageField = screen.getByLabelText('Image URL');
    const descriptionField = screen.getByLabelText('Description');
    const typeField = screen.getByLabelText('Type');
    const rankingField = screen.getByLabelText('Ranking');

    //test to verify the displayed data
    expect(nameField).toHaveValue('Test Name');
    expect(imageField).toHaveValue('Test Link');
    expect(descriptionField).toHaveValue('Test Description');
    expect(typeField).toHaveValue('Custom');
    expect(rankingField).toHaveValue(1);
  });

  test('shows months feild and correct data in it in No Infringement Streak Badge Popup', () => {
    mockBadgeValues.type = 'No Infringement Streak';
    mockBadgeValues.months = 3;
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);
    const monthsField = screen.getByLabelText('Months');

    //test for dynamic months field and data
    expect(monthsField).toBeInTheDocument();
    expect(monthsField).toHaveValue(3);
  });

  test('shows multiple field and correct data in it in Minimum Hours Multiple Badge Popup', () => {
    mockBadgeValues.type = 'Minimum Hours Multiple';
    mockBadgeValues.multiple = 4;
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);
    const multipleField = screen.getByLabelText('Multiple');

    //test for dynamic multiple field and data
    expect(multipleField).toBeInTheDocument();
    expect(multipleField).toHaveValue(4);
  });

  test('shows hours and weeks field and correct data in it in X Hours for X Week Streak Badge Popup', () => {
    mockBadgeValues.type = 'X Hours for X Week Streak';
    mockBadgeValues.totalHrs = 5;
    mockBadgeValues.weeks = 6;
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);
    const hoursField = screen.getByLabelText('Hours');
    const weeksField = screen.getByLabelText('Weeks');

    //test for dynamic hours and weeks fields and data
    expect(hoursField).toBeInTheDocument();
    expect(weeksField).toBeInTheDocument();
    expect(hoursField).toHaveValue(5);
    expect(weeksField).toHaveValue(6);
  });

  test('shows people field and correct data in it in Lead a team of X+ Badge Popup', () => {
    mockBadgeValues.type = 'Lead a team of X+';
    mockBadgeValues.people = 7;
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);
    const peopleField = screen.getByLabelText('People');

    //test for dynamic people field and data
    expect(peopleField).toBeInTheDocument();
    expect(peopleField).toHaveValue(7);
  });

  test('shows correct category dropdown options and hours field in Total Hrs in Category Badge Popup', () => {
    mockBadgeValues.type = 'Total Hrs in Category';
    render(<EditBadgePopup open={true} badgeValues={mockBadgeValues} />);

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    const select = screen.getByLabelText('Category');
    const options = Array.from(select.options).map(option => option.text);
    const expectedCategories = [
      '',
      'Food',
      'Energy',
      'Housing',
      'Education',
      'Society',
      'Economics',
      'Stewardship',
      'Unassigned',
    ];

    //test for options dropdown and dynamic hours field
    expect(options).toEqual(expectedCategories);
    expect(screen.getByLabelText('Hours'));
  });
});

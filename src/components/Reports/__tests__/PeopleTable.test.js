import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PeopleTable from '../PeopleTable';
import moment from 'moment';


describe('PeopleTable component', () => {
  const userProfiles = [
    { firstName: 'Jane', lastName: 'Doe', _id: 1, isActive: true, createdDate: '2023-02-02T20:00:22.224Z', endDate: null },
    { firstName: 'John', lastName: 'Smith', _id: 2, isActive: false, createdDate: '2023-03-02T20:00:22.224Z', endDate: '2024-03-02T20:00:22.224Z' },
  ];

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it('renders the correct number of users', () => {
    renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(userProfiles.length + 1); // +1 for the header row
  });

  it('renders the people details correctly', () => {
    renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    userProfiles.forEach(people => {
      expect(screen.getByText(people.firstName + " " + people.lastName)).toBeInTheDocument();
      expect(screen.getByText(moment(people.createdDate).format('MM-DD-YY'))).toBeInTheDocument();
      expect(screen.getByText(moment(people.endDate).format('MM-DD-YY') || 'N/A')).toBeInTheDocument();
    });
  });

  it('row item links to the correct page', () => {
    renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    userProfiles.forEach(people => {
      expect(screen.getByRole('link', { name: people.firstName + " " + people.lastName })).toHaveAttribute('href', `/peoplereport/${people._id}`);
    });
  });



  it('renders user profiles in sorted order by first name', () => {
    renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    const firstNameElements = screen.getAllByRole('row');
    expect(firstNameElements[1]).toHaveTextContent('Jane');//index 0 is for header row
    expect(firstNameElements[2]).toHaveTextContent('John');
  });

  it('table headers are displayed correctly', () => {
    renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    const tableHeaders = screen.getAllByRole('columnheader');
    expect(tableHeaders.length).toBe(5);
    expect(tableHeaders[0].textContent).toBe('#');
    expect(tableHeaders[1].textContent).toBe('Person Name');
    expect(tableHeaders[2].textContent).toBe('Active');
    expect(tableHeaders[3].textContent).toBe('Start Date');
    expect(tableHeaders[4].textContent).toBe('End Date');
  });


  it('shows the correct active status indicator', () => {
    const { container } = renderWithRouter(<PeopleTable userProfiles={userProfiles} />);
    userProfiles.forEach(people => {
      const row = container.querySelector(`#tr_${people._id}`);
      const activeIcon = people.isActive ? '.fa-circle' : '.fa-circle-o';
      expect(row.querySelector(activeIcon)).toBeInTheDocument();
    });
  });
});

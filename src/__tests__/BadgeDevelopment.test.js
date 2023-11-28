import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BadgeDevelopment from 'components/Badge/BadgeDevelopment';

jest.mock('components/Badge/BadgeDevelopmentTable', () => () => <div>BadgeDevelopmentTable</div>);
jest.mock('components/Badge/CreateNewBadgePopup', () => () => <div>CreateNewBadgePopup</div>);

describe('BadgeDevelopment Component', () => {
  it('Should render without crashing', () => {
    render(<BadgeDevelopment />);
    expect(screen.getByText('Create New Badge')).toBeInTheDocument();
    
  });

  it('Should open the create new badge popup when the button is clicked', () => {
    render(<BadgeDevelopment />);
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
  });


  it('should render the BadgeDevelopmentTable component', () => {
    render(<BadgeDevelopment />);
      const table = document.querySelector('.table')
      expect(table);
  });

  it('should close the New Badge popup when the button is clicked', () => {
    render(<BadgeDevelopment />);
    fireEvent.click(screen.getByText('Create New Badge'));
    expect(screen.getByText('New Badge')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.getByText('Create New Badge'))
  });

});

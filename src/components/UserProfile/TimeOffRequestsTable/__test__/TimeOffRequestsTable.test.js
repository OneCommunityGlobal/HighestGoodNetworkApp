import React from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimeOffRequestsTable from '../TimeOffRequestsTable'; 
import moment from 'moment';

describe('TimeOffRequestsTable Component', () => {
  const mockRequests = [
    {
      _id: '1',
      startingDate: '2024-11-01',
      duration: 1,
      reason: 'Vacation',
    },
    {
      _id: '2',
      startingDate: '2024-12-01',
      duration: 2,
      reason: 'Family Event',
    },
  ];

  const mockOpenModal = jest.fn();

  it('should display "No time off scheduled" when no requests are provided', () => {
    render(<TimeOffRequestsTable requests={[]} openModal={mockOpenModal} darkMode={false} />);
    expect(screen.getByText('No time off scheduled.')).toBeInTheDocument();
  });

  it('should display the correct number of requests', () => {
    render(<TimeOffRequestsTable requests={mockRequests} openModal={mockOpenModal} darkMode={false} />);
    const entries = screen.getAllByText(/\/\d{2}\/\d{4}$/); 
    expect(entries).toHaveLength(4);
  });

  it('renders duration in weeks correctly', () => {
    render(<TimeOffRequestsTable requests={mockRequests} openModal={mockOpenModal} darkMode={false} />);

    const durationCells = screen.getAllByText(/2 Weeks|1 week/);
    expect(durationCells).toHaveLength(2);

    expect(screen.getByText('2 Weeks')).toBeInTheDocument();
    expect(screen.getByText('1 week')).toBeInTheDocument();
  });

  it('should correctly display request details', () => {
    render(<TimeOffRequestsTable requests={mockRequests} openModal={mockOpenModal} darkMode={false} />);
    mockRequests.forEach(request => {
      const dateElement = screen.getAllByText(moment(request.startingDate).format('MM/DD/YYYY'))[0];
      const durationElement = screen.getAllByText(request.duration.toString())[0];
      const reasonElement = screen.getByText(request.reason);

      expect(dateElement).toBeInTheDocument();
      expect(durationElement).toBeInTheDocument();
      expect(reasonElement).toBeInTheDocument();
    });
  });

  it('should open modal when clicking on the icon', () => {
    render(<TimeOffRequestsTable requests={mockRequests} openModal={mockOpenModal} darkMode={false} />);
    const icon = document.querySelector('.user-profile-time-off-div-table-entry-icon svg');
    fireEvent.click(icon.closest('div'));
    expect(mockOpenModal).toHaveBeenCalled();
  });
});



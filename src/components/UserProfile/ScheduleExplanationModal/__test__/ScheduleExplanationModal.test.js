import React from 'react';
import { render, screen,within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScheduleExplanationModal from '../ScheduleExplanationModal.jsx'
import moment from 'moment-timezone';


const mockHandleClose = jest.fn();
const mockInfringements = [
  { _id: '1', date: '2023-12-01', description: 'Missed deadline' },
  { _id: '2', date: '2024-01-15', description: 'Unapproved absence' },
];
const mockTimeOffRequests = [
  { _id: '3', startingDate: '2024-01-10', duration: 5, reason: 'it is the time for my Vacation, and all of my work is done' },
  { _id: '4', startingDate: '2024-03-15', duration: 1, reason: 'I want to take a medical leave, so I need to take a break' },
];

describe('SchedulerExplanationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with correct title and content', () => {
    render(
      <ScheduleExplanationModal
        infringementsNum={3}
        handleClose={mockHandleClose}
        infringements={mockInfringements}
        timeOffRequests={mockTimeOffRequests}
      />
    );
    expect(screen.getByText('Please Refer To The Explanation')).toBeInTheDocument();

    expect(
      screen.getByText(/Including your time already requested off, you have used the equivalent of/)
    ).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveStyle('color: red'); 
    expect(screen.getByText('2')).toHaveStyle('color: red'); 
    expect(screen.getByText('5 weeks')).toBeInTheDocument(); 
  });


  it('renders infringements list correctly', () => {
    const {container} = render(
      <ScheduleExplanationModal
        infringementsNum={3}
        handleClose={mockHandleClose}
        infringements={mockInfringements}
        timeOffRequests={[]}
      />
    );
    expect(screen.getByText('INFRINGEMENTS:')).toBeInTheDocument();

    const infringementsSection = container.querySelector('.Schedule-explanation-modal-list-marker');
    const boldText = infringementsSection.querySelectorAll('b');
    expect(boldText[0]).toHaveTextContent('Date:');
    expect(boldText[1]).toHaveTextContent('Reason:');

    expect(screen.getByText(/2023-12-01/i)).toBeInTheDocument();
    expect(screen.getByText('Missed deadline')).toBeInTheDocument();
    expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
    expect(screen.getByText('Unapproved absence')).toBeInTheDocument();

  });


  it('renders time off requests list correctly', () => {
    render(
      <ScheduleExplanationModal
        infringementsNum={3}
        handleClose={mockHandleClose}
        infringements={[]}
        timeOffRequests={mockTimeOffRequests}
      />
    );

    expect(screen.getByText('SCHEDULED TIME OFF:')).toBeInTheDocument();
    expect(screen.getByText(moment('2024-01-10').format('MM-DD-YYYY'))).toBeInTheDocument();
    expect(screen.getByText('5 weeks')).toBeInTheDocument();
    expect(screen.getByText(/Vacation/i)).toBeInTheDocument();
  });

  it('calls handleClose when Close button is clicked', async () => {
    const {container} = render(
      <ScheduleExplanationModal
        infringementsNum={3}
        handleClose={mockHandleClose}
        infringements={[]}
        timeOffRequests={[]}
      />
    );
    expect(screen.getByText(/Blue squares expire after 1 calendar year from their issuance date./i)).toBeInTheDocument();
    const modalFooter = container.querySelector('.modal-footer');    
    const closeButton = within(modalFooter).getByRole('button', { name: /Close/i });
    await userEvent.click(closeButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  
});

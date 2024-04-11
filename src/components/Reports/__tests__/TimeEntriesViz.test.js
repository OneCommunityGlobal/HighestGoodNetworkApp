import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimeEntriesViz from '../TimeEntriesViz';

const timeEntries = [
  {
    _id: 'time123',
    createdDateTime: '2023-12-05T06:14:07.465+00:00',
    notes: 'new notes',
    totalSeconds: 4230,
    projectId: 'project123',
    personId: 'person123',
    lastModifiedDateTime: '2023-12-05T06:14:07.465+00:00',
    __v: 0,
    isTangible: true,
    dateOfWork: '2018-01-27',
  },
];
const fromDate = '2023-12-05T06:14:07.465+00:00';
const toDate = '2023-12-25T06:14:07.465+00:00';

describe('TimeEntriesViz component', () => {
  it('check if component renders properly without crashing', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
  });
  it('check if Show Time Entries Graph button is shown when show is set to false', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    expect(screen.getByText('Show Time Entries Graph')).toBeInTheDocument();
  });
  it('check if Hide Time Entries Graph button is not shown when show is set to false', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    expect(screen.queryByText('Hide Time Entries Graph')).not.toBeInTheDocument();
  });
  it('check if Hide Time Entries Graph button is shown when show is set to true', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    expect(screen.getByText('Hide Time Entries Graph')).toBeInTheDocument();
  });
  it('check if Show Time Entries Graph button is not shown when show is set to true', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    expect(screen.queryByText('Show Time Entries Graph')).not.toBeInTheDocument();
  });
});

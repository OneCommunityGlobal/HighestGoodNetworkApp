import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TimeEntriesViz from '../TimeEntriesViz';

const timeEntries = {
  period: [
    {
      hours: 5,
      minutes: 30,
      dateOfWork: '2023-12-05T06:14:07.465+00:00',
      _id: 'time123',
      createdDateTime: '2023-12-05T06:14:07.465+00:00',
      notes: 'new notes',
      totalSeconds: 4230,
      projectId: 'project123',
      personId: 'person123',
      lastModifiedDateTime: '2023-12-05T06:14:07.465+00:00',
      isTangible: true,
      dateOfWork: '2018-01-27',
    },
  ],
};
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
  it('check if Total Hours displays 0 when period key is not present in timeEntries', () => {
    const newTimeEntries = [];
    render(<TimeEntriesViz timeEntries={newTimeEntries} fromDate={fromDate} toDate={toDate} />);
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);

    expect(screen.getByText('Total Hours: 0.00')).toBeInTheDocument();
  });
  it('check if Total Hours displays as expected when period key is present', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    let totalHours = 0;

    for (let i = 0; i < timeEntries.period.length; i += 1) {
      const convertedHours =
        parseInt(timeEntries.period[i].hours, 10) +
        (timeEntries.period[i].minutes === '0'
          ? 0
          : parseInt(timeEntries.period[i].minutes, 10) / 60);
      totalHours += convertedHours;
    }

    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    totalHours = totalHours.toFixed(2);

    expect(screen.getByText(`Total Hours: ${totalHours}`)).toBeInTheDocument();
  });
  it('check if Labels Off button works as expected', () => {
    const { container } = render(
      <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />,
    );
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    const labelsOnButton = container.querySelector('.entCountLabelsOn');
    fireEvent.click(labelsOnButton);
    //const labelsButton = container.querySelector('.entLabelsOff');
    //fireEvent.click(labelsButton);
  });
  it('check Show Daily Hours labels', () => {
    const { container } = render(
      <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />,
    );
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    expect(screen.getByText('Show Daily Hours')).toBeInTheDocument();
    const labelsButton = container.querySelector('.entLabelsOff');
    fireEvent.click(labelsButton);
  });
  it('check Show Dates labels', () => {
    const { container } = render(
      <TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />,
    );
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    expect(screen.getByText('Show Dates')).toBeInTheDocument();
    const dateLabelsButton = container.querySelector('.entDateLabelsOn');
    fireEvent.click(dateLabelsButton);
    screen.debug();
  });
  it('check label values', () => {
    render(<TimeEntriesViz timeEntries={timeEntries} fromDate={fromDate} toDate={toDate} />);
    const buttonElement = screen.getByText('Show Time Entries Graph');
    fireEvent.click(buttonElement);
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0.2')).toBeInTheDocument();
    expect(screen.getByText('0.4')).toBeInTheDocument();
    expect(screen.getByText('0.6')).toBeInTheDocument();
    expect(screen.getByText('0.8')).toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    expect(screen.getByText('1.2')).toBeInTheDocument();
    expect(screen.getByText('1.4')).toBeInTheDocument();
    expect(screen.getByText('1.6')).toBeInTheDocument();
    expect(screen.getByText('1.8')).toBeInTheDocument();
    expect(screen.getByText('2.0')).toBeInTheDocument();
  });
});

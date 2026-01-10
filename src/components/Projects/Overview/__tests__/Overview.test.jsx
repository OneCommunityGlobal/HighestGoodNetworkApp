import React from 'react';
import { render, screen } from '@testing-library/react';
import Overview from '../Overview';

describe('Overview Component', () => {
  it('renders correctly with props', () => {
    render(<Overview numberOfProjects={3} numberOfActive={2} />);

    // Check if the component renders correctly
    expect(screen.getByText('Total Projects: 3')).toBeInTheDocument();
    expect(screen.getByText('Active Projects: 2')).toBeInTheDocument();
  });

  it('displays the correct number of projects and active projects', () => {
    render(<Overview numberOfProjects={5} numberOfActive={3} />);

    expect(screen.getByText('Total Projects: 5')).toBeInTheDocument();
    expect(screen.getByText('Active Projects: 3')).toBeInTheDocument();
  });

});

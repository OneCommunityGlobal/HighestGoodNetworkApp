import { render, screen } from '@testing-library/react';
import Overview from './Overview';

describe('Overview Component', () => {
  it('renders correctly with props', () => {
    render(<Overview numberOfProjects={3} numberOfActive={2} />);

    // Check if the component renders correctly
    expect(screen.getByText('3')).toBeInTheDocument(); 
    expect(screen.getByText('2')).toBeInTheDocument(); 
  });

  it('displays the correct number of projects and active projects', () => {
    render(<Overview numberOfProjects={5} numberOfActive={3} />);

    // Check if the correct number of projects is displayed
    expect(screen.getByText('5')).toBeInTheDocument(); 

    // Check if the correct number of active projects is displayed
    expect(screen.getByText('3')).toBeInTheDocument(); 
  });

});

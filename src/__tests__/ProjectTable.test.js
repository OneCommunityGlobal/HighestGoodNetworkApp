import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectTable from '../components/Reports/ProjectTable'; // Adjust the import path as necessary
import { BrowserRouter } from 'react-router-dom';

describe('ProjectTable component', () => {
  const mockProjects = [
    { _id: '1', projectName: 'Project Alpha', isActive: true },
    { _id: '2', projectName: 'Project Beta', isActive: false },
    // Add more mock projects as needed
  ];

  const renderWithRouter = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it('renders the correct number of projects', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(mockProjects.length + 1); // +1 for the header row
  });

  it('displays the project names and links correctly', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} />);
    mockProjects.forEach(project => {
      expect(screen.getByText(project.projectName)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: project.projectName })).toHaveAttribute('href', `/projectreport/${project._id}`);
    });
  });

  it('shows the correct active status indicator', () => {
    const { container } = renderWithRouter(<ProjectTable projects={mockProjects} />);
    mockProjects.forEach(project => {
      const row = container.querySelector(`#tr_${project._id}`);
      const activeIcon = project.isActive ? '.fa-circle' : '.fa-circle-o';
      expect(row.querySelector(activeIcon)).toBeInTheDocument();
    });
  });

});

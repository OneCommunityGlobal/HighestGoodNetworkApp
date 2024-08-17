import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectTable from '../ProjectTable';
import { BrowserRouter } from 'react-router-dom';

describe('ProjectTable component', () => {
  const mockProjects = [
    { _id: '1', projectName: 'Project Alpha', isActive: true },
    { _id: '2', projectName: 'Project Beta', isActive: false },
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

  it('renders the table with light mode styles when darkMode is false', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} darkMode={false} />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('table-bordered');

    const thead = table.querySelector('thead');
    expect(thead).not.toHaveClass('bg-space-cadet');

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).not.toHaveClass('text-light');
    });
  });

  it('renders an empty table when no projects are provided', () => {
    renderWithRouter(<ProjectTable projects={[]} />);
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(1); // Only the header row
  });

  it('renders with correct table header labels', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} />);
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Project Name')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply ARIA roles correctly', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} />);
    expect(screen.getAllByRole('row')).toHaveLength(mockProjects.length + 1);
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });
  
  it('should handle invalid darkMode prop gracefully', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} darkMode={undefined} />);
    const table = screen.getByRole('table');
    expect(table).toHaveClass('table-bordered'); // Assumes default is light mode
  });
  it('renders the table with dark mode styles when darkMode is true', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} darkMode={true} />);
    const table = screen.getByRole('table');
    const thead = table.querySelector('thead');
  
    expect(table).toHaveClass('bg-yinmn-blue');  
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('text-light');
    });
  });
  
  it('applies the hover effect class in dark mode', () => {
    renderWithRouter(<ProjectTable projects={mockProjects} darkMode={true} />);
    const rows = screen.getAllByRole('row');
    
    // Skip the header row
    rows.slice(1).forEach(row => {
      // Simulate hover
      row.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      console.log('Table classes:', row.className);
      // Check if the hover effect class is applied
      expect(row).toHaveClass('bg-yinmn-blue');
      
      // Optionally, you could simulate mouse out and verify the class removal if needed
      row.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      expect(row).not.toHaveClass('bg-yinmn-blue');
    });
  });
  
});

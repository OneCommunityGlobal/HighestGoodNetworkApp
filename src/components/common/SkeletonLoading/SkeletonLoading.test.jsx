import { render, screen } from '@testing-library/react';
import SkeletonLoading from './SkeletonLoading';

describe('SkeletonLoading Component', () => {
  let consoleErrorMock;

  beforeEach(() => {
    // Mock console.error before each test
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorMock.mockRestore();
  });

  // Assuming you have specific class names for each template type
  it('renders Timelog template', () => {
    render(<SkeletonLoading template="Timelog" />);
    expect(document.querySelector('.skeleton-loading-timelog')).toBeInTheDocument();
  });

  it('renders TimelogFilter template', () => {
    render(<SkeletonLoading template="TimelogFilter" />);
    expect(document.querySelector('.skeleton-loading-timelog-filter')).toBeInTheDocument();
  });

  it('renders TeamMemberTasks template', () => {
    render(<SkeletonLoading template="TeamMemberTasks" />);
    const rows = document.querySelectorAll('.skeleton-loading-team-member-tasks-row');
    expect(rows).toHaveLength(15);
  });

  it('renders WeeklySummary template', () => {
    render(<SkeletonLoading template="WeeklySummary" />);
    expect(document.querySelector('.skeleton-loading-weekly-summary')).toBeInTheDocument();
  });

  it('renders WeeklySummariesReport template', () => {
    render(<SkeletonLoading template="WeeklySummariesReport" />);
    const items = document.querySelectorAll('.skeleton-loading-weekly-summaries-report-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('renders UserProfile template', () => {
    render(<SkeletonLoading template="UserProfile" />);
    const userProfileItems = document.querySelectorAll('.skeleton-loading-user-profile-item');
    expect(userProfileItems.length).toBeGreaterThan(0); // Or check for a specific number if applicable
  });

  it('renders UserManagement template', () => {
    render(<SkeletonLoading template="UserManagement" />);
    const items = document.querySelectorAll('.skeleton-loading-user-management-item');
    expect(items).toHaveLength(17);
  });

  it('renders default case correctly', () => {
    render(<SkeletonLoading template="UnknownTemplate" />);
    // Here you might want to check for the absence of all known class names
    expect(document.querySelector('.skeleton-loading-default')).toBeNull();
  });
});

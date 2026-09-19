import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import UserCard from './UserCard';

vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));

const baseUser = {
  name: 'Ada Lovelace',
  slack: 'ada',
  score: 9,
  topSkills: ['React'],
};

describe('UserCard email rendering', () => {
  it('renders a valid email as an accessible mailto link', () => {
    render(<UserCard user={{ ...baseUser, email: 'ada@example.com' }} />);

    const emailLink = screen.getByRole('link', { name: 'Email Ada Lovelace' });
    expect(emailLink).toHaveAttribute('href', 'mailto:ada@example.com');
    expect(emailLink).toHaveTextContent('ada@example.com');
  });

  it('renders N/A as plain text without an email link', () => {
    render(<UserCard user={{ ...baseUser, email: 'N/A' }} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Email Ada Lovelace' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /mailto/i })).not.toBeInTheDocument();
  });

  it.each([null, undefined, ''])('renders %p as N/A without a mailto link', email => {
    render(<UserCard user={{ ...baseUser, email }} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Email Ada Lovelace' })).not.toBeInTheDocument();
  });
});

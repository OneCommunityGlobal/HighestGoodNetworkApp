import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Leave Feedback button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Leave Feedback/i); // Looking for the "Leave Feedback" button
  expect(buttonElement).toBeInTheDocument(); // Asserting that it is in the document
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateNewBadgePopup from 'components/Badge/CreateNewBadgePopup';

// Mocking Redux connect
jest.mock('react-redux', () => ({
  connect: (mapStateToProps, mapDispatchToProps) => (Component) => (props) =>
    <Component {...props} {...mapStateToProps} {...mapDispatchToProps} />
}));

describe('CreateNewBadgePopup Component', () => {
  test('renders without crashing', () => {
    render(<CreateNewBadgePopup />);
  });

  test('updates state on input change', () => {
    const { getByLabelText } = render(<CreateNewBadgePopup />);
    const badgeNameInput = getByLabelText('Name');

    fireEvent.change(badgeNameInput, { target: { value: 'Test Badge' } });

    expect(badgeNameInput.value).toBe('Test Badge');
  });

  test('disables create button when required fields are empty', async () => {
    const { getByText } = render(<CreateNewBadgePopup />);
    const createButton = getByText('Create');

    fireEvent.click(createButton);

    // Check if the create button is still disabled
    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });

  test('enables create button when all required fields are filled', async () => {
    const { getByLabelText, getByText } = render(<CreateNewBadgePopup />);
    const badgeNameInput = getByLabelText('Name');
    const imageUrlInput = getByLabelText('Image URL');
    const descriptionInput = getByLabelText('Description');
    const rankingInput = getByLabelText('Ranking');
    const createButton = getByText('Create');

    fireEvent.change(badgeNameInput, { target: { value: 'Sample Badge' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });
    fireEvent.change(descriptionInput, { target: { value: 'Sample Description' } });
    fireEvent.change(rankingInput, { target: { value: '1' } });

    // Check if the create button is enabled
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
  });
});


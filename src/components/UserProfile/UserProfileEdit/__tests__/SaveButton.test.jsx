import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { userProfileMock } from '../../../../__tests__/mockStates';
import SaveButton from '../SaveButton';

const createProps = overrides => ({
  handleSubmit: vi.fn(),
  disabled: false,
  userProfile: userProfileMock,
  setSaved: vi.fn(),
  darkMode: true,
  ...overrides,
});

describe('<SaveButton />', () => {
  it('renders the save changes button', () => {
    render(<SaveButton {...createProps()} />);

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('renders the save changes button in a disabled state', () => {
    render(<SaveButton {...createProps({ disabled: true })} />);

    expect(screen.getByRole('button', { name: /save changes/i })).toBeDisabled();
  });

  it('renders the confirmation modal after the save button is clicked', async () => {
    render(<SaveButton {...createProps()} />);

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('preserves the parent modal scroll position while saving', async () => {
    let modalBody;
    const handleSubmit = vi.fn(async () => {
      modalBody.scrollTop = 0;
    });
    render(
      <div id="volunteer-time-modal-body" data-testid="volunteer-time-modal-body">
        <SaveButton
          {...createProps({
            handleSubmit,
            scrollContainerId: 'volunteer-time-modal-body',
          })}
        />
      </div>,
    );
    modalBody = screen.getByTestId('volunteer-time-modal-body');
    modalBody.scrollTop = 240;

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.mouseDown(saveButton);
    fireEvent.click(saveButton);

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledOnce());
    await waitFor(() => expect(modalBody.scrollTop).toBe(240));
  });

  it('restores the modal position after the saved profile is rendered', async () => {
    const initialProfile = { ...userProfileMock };
    const { rerender } = render(
      <div id="volunteer-time-modal-body" data-testid="volunteer-time-modal-body">
        <SaveButton
          {...createProps({
            userProfile: initialProfile,
            scrollContainerId: 'volunteer-time-modal-body',
          })}
        />
      </div>,
    );
    const modalBody = screen.getByTestId('volunteer-time-modal-body');
    modalBody.scrollTop = 320;

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.mouseDown(saveButton);
    fireEvent.click(saveButton);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    modalBody.scrollTop = 0;
    rerender(
      <div id="volunteer-time-modal-body" data-testid="volunteer-time-modal-body">
        <SaveButton
          {...createProps({
            userProfile: { ...initialProfile, weeklycommittedHours: 25 },
            scrollContainerId: 'volunteer-time-modal-body',
          })}
        />
      </div>,
    );

    expect(modalBody.scrollTop).toBe(320);
  });

  it('cancels a pending scroll restoration when unmounted', () => {
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const handleSubmit = vi.fn(() => new Promise(() => {}));
    const { unmount } = render(<SaveButton {...createProps({ handleSubmit })} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.mouseDown(saveButton);
    fireEvent.click(saveButton);
    expect(requestFrame).toHaveBeenCalled();

    unmount();

    expect(cancelFrame).toHaveBeenCalledWith(42);
    requestFrame.mockRestore();
    cancelFrame.mockRestore();
  });

  it('clears the previous error when a failed save is retried', async () => {
    const handleSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockImplementationOnce(() => new Promise(() => {}));
    render(<SaveButton {...createProps({ handleSubmit })} />);

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(await screen.findByText('Error occurred')).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    await userEvent.click(closeButtons[closeButtons.length - 1]);
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText('Saving...')).toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });

  it('prevents duplicate submissions while a save is in progress', async () => {
    const handleSubmit = vi.fn(() => new Promise(() => {}));
    render(<SaveButton {...createProps({ handleSubmit })} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    expect(handleSubmit).toHaveBeenCalledOnce();
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveAttribute('aria-busy', 'true');
  });
});

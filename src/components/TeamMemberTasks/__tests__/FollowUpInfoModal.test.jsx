import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FollowUpInfoModal from '../FollowUpInfoModal';

const renderModal = (darkMode = false) =>
  render(
    <Provider store={configureStore([])({ theme: { darkMode } })}>
      <FollowUpInfoModal />
    </Provider>,
  );

describe('FollowUpInfoModal', () => {
  it('stays closed until the info icon is hovered', () => {
    renderModal();
    expect(screen.queryByText(/yellow warning triangle/i)).not.toBeInTheDocument();
  });

  it('explains progress as hours logged against estimated hours', () => {
    renderModal();
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Follow up info' }));
    expect(
      screen.getByText(/hours logged compared to the task's estimated hours/i),
    ).toBeInTheDocument();
  });

  it('explains what triggers the yellow warning triangle and how to clear it', () => {
    renderModal();
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Follow up info' }));
    const text = screen.getByText(/yellow warning triangle/i).textContent;
    expect(text).toMatch(/more hours are logged after the box was checked/i);
    expect(text).toMatch(/Click the triangle to clear it, which unchecks the box/i);
  });

  it('explains the red number next to the icon', () => {
    renderModal(true);
    fireEvent.focus(screen.getByRole('button', { name: 'Follow up info' }));
    expect(
      screen.getByText(/how many times the task's estimated\s+hours were increased/i),
    ).toBeInTheDocument();
  });
});

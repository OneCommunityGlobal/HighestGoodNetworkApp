import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { configureStore } from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import React from 'react';
import InfoModal from '../InfoModal';

const mockStore = configureStore();

describe('InfoModal', () => {
  const store = mockStore({
    theme: themeMock,
  });

  const headerText = 'Restrict the team member visiblity';

  describe('Renders correctly with text and toggle button', () => {
    it('InfoModal renders with expected text', () => {
      const toggle = vi.fn();
      render(
        <Provider store={store}>
          <InfoModal isOpen toggle={toggle} />
        </Provider>,
      );
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    it('Clicking `Ok` button closes InfoModal so it is not present', async () => {
      function Wrapper() {
        const [isOpen, setIsOpen] = React.useState(true);
        const toggle = () => setIsOpen(false);

        return (
          <Provider store={store}>
            <InfoModal isOpen={isOpen} toggle={toggle} />
          </Provider>
        );
      }

      render(<Wrapper />);

      const okButton = screen.getByText('Ok');
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(screen.queryByText(headerText)).not.toBeInTheDocument();
      });
    });
  });
});

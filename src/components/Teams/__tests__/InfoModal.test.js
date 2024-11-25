import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import InfoModal from '../InfoModal';

const mockStore = configureStore();

describe('InfoModal', () => {
  let props;

  const store = mockStore({
    theme: themeMock,
  });

  let renderInfoModal = props => {
    const { rerender } = render(
      <Provider store={store}>
        <InfoModal {...props} />
      </Provider>,
    );

    return rerender;
  };
  const headerText = 'Restrict the team member visiblity';

  describe('Renders correctly with text and toggle button', () => {
    it('InfoModal renders with expected text', () => {
      renderInfoModal(props);
      expect(screen.getByText(headerText));
    });

    it('Clicking  `Ok` button closes InfoModal so it is not present', () => {
      const rerender = renderInfoModal(props);
      const okButton = screen.getByText('Ok');
      fireEvent.click(okButton);
      rerender();
      expect(screen.queryByText(headerText)).not.toBeInTheDocument();
    });

    beforeEach(() => {
      let isOpen = true;

      const toggle = () => {
        isOpen = !isOpen;
      };

      props = {
        isOpen,
        toggle,
      };
    });
  });
});
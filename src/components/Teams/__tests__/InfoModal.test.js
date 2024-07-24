import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    render(
      <Provider store={store}>
        <InfoModal {...props} />
      </Provider>,
    );
  };

  describe('Renders correctly with text', () => {
    it('InfoModal renders with expected text', () => {
      renderInfoModal(props);

      const headerText = 'Restrict the team member visiblity';
      expect(screen.getByText(headerText));
    });

    beforeEach(() => {
      let isOpen = true;

      props = {
        isOpen,
        toggle: () => (isOpen = !isOpen),
      };
    });
  });
});

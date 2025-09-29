import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { themeMock } from '../../../__tests__/mockStates';
import DiffedText from '../components/DiffedText';

const mockStore = configureStore([]);

describe('DiffedText Component', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      theme: themeMock,
    });

    render(
      <Provider store={store}>
        <DiffedText oldText="" newText="" />
      </Provider>,
    );
  });

  it('displays the correct diff output', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const { getByText } = render(
      <Provider store={store}>
        <DiffedText oldText="Hello world" newText="Hello React world" />
      </Provider>,
    );
    expect(screen.getByText('Hello')).toHaveStyle('color: rgb(255, 255, 255)');
    expect(screen.getByText('world')).toHaveStyle('color: rgb(255, 255, 255)');
    expect(screen.getByText('React')).toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('handles text removal correctly', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const { getByText } = render(
      <Provider store={store}>
        <DiffedText oldText="Hello world" newText="Hello" />
      </Provider>,
    );
    expect(screen.getByText('world')).toHaveStyle(
      'textDecorationLine: line-through; color: rgb(255, 0, 0)',
    );
  });
});

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
    // Vitest/jsdom may return color names instead of RGB, so check for both
    const helloColor = window.getComputedStyle(screen.getByText('Hello')).color;
    const worldColor = window.getComputedStyle(screen.getByText('world')).color;
    const reactColor = window.getComputedStyle(screen.getByText('React')).color;

    expect(['rgb(255, 255, 255)', 'white']).toContain(helloColor);
    expect(['rgb(255, 255, 255)', 'white']).toContain(worldColor);
    expect(['rgb(0, 128, 0)', 'green']).toContain(reactColor);
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
    const worldElement = screen.getByText('world');
    const textDecoration = window.getComputedStyle(worldElement).textDecorationLine;
    const color = window.getComputedStyle(worldElement).color;

    expect(textDecoration).toBe('line-through');
    expect(['rgb(255, 0, 0)', 'red']).toContain(color);
  });
});

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiffedText from '../components/DiffedText';
import { themeMock } from '__tests__/mockStates';

const mockStore = configureStore([]);

describe('DiffedText Component', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      theme: themeMock,
    });

    render(
      <Provider store={store}>
        <DiffedText oldText="" newText="" />
      </Provider>
    );
  });

  it('displays the correct diff output', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const { getByText } = render(
      <Provider store={store}>
        <DiffedText oldText="Hello world" newText="Hello React world" />
      </Provider>
    );
    expect(getByText('Hello')).toHaveStyle('color: white');
    expect(getByText('world')).toHaveStyle('color: white');
    expect(getByText('React')).toHaveStyle('color: green');
  });

  it('handles text removal correctly', () => {
    const store = mockStore({
      theme: themeMock,
    });

    const { getByText } = render(
      <Provider store={store}>
        <DiffedText oldText="Hello world" newText="Hello" />
      </Provider>
    );
    expect(getByText('world')).toHaveStyle('textDecorationLine: line-through; color: red');
  });

});

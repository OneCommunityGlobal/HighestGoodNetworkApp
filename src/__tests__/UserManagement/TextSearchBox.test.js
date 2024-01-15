import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextSearchBox from '../../components/UserManagement/TextSearchBox';

describe('text search box', () => {
  let searchCallback;
  const id = 'test_search';
  beforeEach(() => {
    searchCallback = jest.fn();
    render(<TextSearchBox id={id} searchCallback={searchCallback} />);
  });
  it('should render a textbox', () => {
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
  it('should change text while users typing', async () => {
    await userEvent.type(screen.getByRole('textbox'), 'test', { allAtOnce: false });
    expect(screen.getByRole('textbox')).toHaveValue('test');
  });
  it('should call searchCallback everytime the user types a letter', async () => {
    await userEvent.type(screen.getByRole('textbox'), 'test');
    expect(searchCallback).toHaveBeenCalledTimes(4);
  });
});

describe('text search box', () => {
  it('should correctly render input area with constructor values', () => {
    render(<TextSearchBox />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('text search box', () => {
  let searchCallbacktest;
  const value = 'initial search';
  const id = 'function test';
  beforeEach(() => {
    searchCallbacktest = jest.fn();
    render(<TextSearchBox props={(id, value)} searchCallback={searchCallbacktest} />);
  });
  it('should not call searchCallback when no user input', () => {
    expect(searchCallbacktest).toHaveBeenCalledTimes(0);
  });
  it('should show the user input', async () => {
    await userEvent.type(
      screen.getByRole('textbox'),
      'this is a test message for the text search box',
    );
    expect(screen.getByRole('textbox')).toHaveValue(
      'this is a test message for the text search box',
    );
  });
});
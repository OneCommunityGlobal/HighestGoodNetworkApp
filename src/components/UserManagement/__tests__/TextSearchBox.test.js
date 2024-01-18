import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextSearchBox from '../TextSearchBox';

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

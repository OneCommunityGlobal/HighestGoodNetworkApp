import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonTagPicker from '../LessonTagPicker';
let scroll;
let original;
beforeEach(() => {
  original = Element.prototype.scrollIntoView;
  scroll = vi.fn();
  Element.prototype.scrollIntoView = scroll;
});
afterEach(() => {
  if (original) Element.prototype.scrollIntoView = original;
  else delete Element.prototype.scrollIntoView;
});
function Picker() {
  const [value, change] = useState('');
  const [selected, select] = useState([]);
  return (
    <LessonTagPicker
      id="scroll-tags"
      label="Scrollable tags"
      value={value}
      onInputChange={change}
      availableTags={Array.from(
        { length: 20 },
        (_, index) => `Tag ${String(index).padStart(2, '0')}`,
      )}
      selectedTags={selected}
      onSelect={tag => {
        select([...selected, tag]);
        change('');
      }}
    />
  );
}
it('scrolls the last suggestion into view when opening with ArrowUp', () => {
  render(<Picker />);
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.getAttribute('aria-activedescendant')).toBe('scroll-tags-option-19');
  expect(scroll.mock.instances.at(-1)).toBe(screen.getByRole('option', { name: 'Tag 19' }));
  expect(scroll).toHaveBeenLastCalledWith({ block: 'nearest', inline: 'nearest' });
  fireEvent.keyDown(input, { key: 'Enter' });
  expect(screen.queryByRole('listbox')).toBeNull();
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(screen.queryByRole('option', { name: 'Tag 19' })).toBeNull();
});
it('requests scrolling as keyboard navigation moves beyond the visible portion of a long dropdown', () => {
  render(<Picker />);
  const input = screen.getByRole('combobox');
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  for (let index = 1; index <= 12; index += 1) {
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(scroll.mock.instances.at(-1)).toBe(
      screen.getByRole('option', { name: `Tag ${String(index).padStart(2, '0')}` }),
    );
  }
  fireEvent.keyDown(input, { key: 'ArrowUp' });
  expect(input.getAttribute('aria-activedescendant')).toBe('scroll-tags-option-11');
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(input.getAttribute('aria-expanded')).toBe('false');
  expect(input.getAttribute('aria-activedescendant')).toBeNull();
});

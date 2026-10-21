import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import LessonCard from './LessonCard';

const lessons = [
  { _id: 'lesson1', title: 'Math', tags: ['algebra'], date: '2026-10-21', likes: [] },
  {
    _id: 'storage',
    title: 'Tag Storage',
    tags: ['history'],
    date: '2026-10-20',
    likes: [],
    author: '000000000000000000000000',
  },
];

function Cards({ darkMode }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const store = React.useMemo(
    () =>
      createStore(() => ({
        theme: { darkMode },
        auth: { user: { userid: 'user1' } },
        lessons: { lessons },
      })),
    [darkMode],
  );
  return (
    <Provider store={store}>
      <LessonCard
        filteredLessons={lessons}
        selectedLessonIds={selectedIds}
        setSelectedLessonIds={setSelectedIds}
        handleLike={vi.fn()}
        onEditLessonSummary={vi.fn()}
        onDeliteLessonCard={vi.fn()}
      />
    </Provider>
  );
}

describe('lesson card selection', () => {
  it.each([false, true])('adds an unlabeled checkbox to every record in dark mode=%s', darkMode => {
    render(<Cards darkMode={darkMode} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(screen.queryByText('Select', { exact: true })).toBeNull();
    const math = screen.getByRole('checkbox', { name: 'Select lesson Math' });
    const storage = screen.getByRole('checkbox', { name: 'Select lesson Tag Storage' });
    fireEvent.click(math);
    fireEvent.click(storage);
    expect(math.checked).toBe(true);
    expect(storage.checked).toBe(true);
    // Selecting a record leaves its title/tags visible without expanding it.
    expect(screen.queryByText('Tags:', { exact: true })).toBeNull();
    expect(screen.getByText('Math', { exact: true })).toBeTruthy();
    expect(screen.getByText('Tag Storage', { exact: true })).toBeTruthy();
    expect(screen.getByText('#algebra', { exact: true })).toBeTruthy();
    expect(screen.getByText('#history', { exact: true })).toBeTruthy();
  });
});

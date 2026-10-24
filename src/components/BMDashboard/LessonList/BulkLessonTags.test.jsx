import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import BulkLessonTags from './BulkLessonTags';

vi.mock('axios', () => ({ default: { post: vi.fn(), get: vi.fn() } }));
vi.mock('~/utils/URL', () => ({ ENDPOINTS: { BM_LESSONS: '/api/bm/lessons' } }));

describe('bulk lesson tag workflow', () => {
  let props;
  const changes = [
    { lessonId: 'lesson1', title: 'Safety', before: ['old'], after: ['old', 'new'] },
  ];
  beforeEach(() => {
    vi.clearAllMocks();
    props = {
      filteredLessons: [
        { _id: 'lesson1', title: 'Safety' },
        { _id: 'lesson2', title: 'Tools' },
      ],
      currentUser: { userid: 'user1', role: 'Administrator' },
      selectedIds: ['lesson1'],
      setSelectedIds: vi.fn(),
      availableTags: ['old', 'new'],
      darkMode: false,
      onRefresh: vi.fn().mockResolvedValue(undefined),
    };
    axios.post.mockResolvedValue({ data: { changes } });
  });

  const chooseTag = () => {
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search existing tags' }));
    fireEvent.click(screen.getByLabelText('Tag new'));
  };

  it('selects exactly the filtered lessons', () => {
    render(<BulkLessonTags {...props} />);
    fireEvent.click(screen.getByLabelText('Select all editable lessons'));
    expect(props.setSelectedIds).toHaveBeenCalledWith(['lesson1', 'lesson2']);
  });

  it('limits select-all and search selection to lessons the user can edit', () => {
    props.currentUser = { userid: 'user1', role: 'Volunteer' };
    props.filteredLessons[0].author = { id: 'user1' };
    props.filteredLessons[1].author = { id: 'other' };
    render(<BulkLessonTags {...props} selectedIds={[]} />);
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search lessons' }));
    expect(screen.getByLabelText('Select lesson Safety from search').disabled).toBe(false);
    expect(screen.getByLabelText('Select lesson Tools from search').disabled).toBe(true);
    fireEvent.click(screen.getByLabelText('Select lesson Tools from search'));
    expect(props.setSelectedIds).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText('Select all editable lessons'));
    expect(props.setSelectedIds).toHaveBeenCalledWith(['lesson1']);
  });

  it('searches lesson titles without losing selections when the query changes', () => {
    function SearchSelection() {
      const [selectedIds, setSelectedIds] = React.useState([]);
      return (
        <BulkLessonTags {...props} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      );
    }
    render(<SearchSelection />);
    const search = screen.getByRole('searchbox', { name: 'Search lessons' });
    expect(search).toBeVisible();
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: 'sAF' } });
    expect(screen.queryByLabelText('Select lesson Tools from search')).toBeNull();
    fireEvent.click(screen.getByLabelText('Select lesson Safety from search'));
    expect(
      within(screen.getByRole('list', { name: 'Selected lessons' })).getByText('Safety'),
    ).toBeTruthy();
    fireEvent.change(search, { target: { value: 'Tools' } });
    fireEvent.click(screen.getByLabelText('Select lesson Tools from search'));
    expect(
      within(screen.getByRole('list', { name: 'Selected lessons' })).getByText('Safety'),
    ).toBeTruthy();
    expect(
      within(screen.getByRole('list', { name: 'Selected lessons' })).getByText('Tools'),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Deselect lesson Tools' }));
    expect(screen.getByLabelText('Select lesson Tools from search').checked).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('shows a helpful result when no lesson title matches', () => {
    render(<BulkLessonTags {...props} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search lessons' }), {
      target: { value: 'does not exist' },
    });
    expect(screen.getByText('No matching lessons in the current filtered list.')).toBeTruthy();
    expect(
      within(screen.getByRole('list', { name: 'Selected lessons' })).getByText('Safety'),
    ).toBeTruthy();
  });

  it('shows search immediately and filters tags without a disclosure step', () => {
    render(<BulkLessonTags {...props} />);
    const search = screen.getByRole('searchbox', { name: 'Search existing tags' });
    expect(search).toBeVisible();
    expect(screen.queryByText(/Choose tags/)).toBeNull();
    fireEvent.focus(search);
    expect(screen.getByLabelText('Tag old')).toBeTruthy();
    fireEvent.change(search, { target: { value: 'new' } });
    expect(screen.queryByLabelText('Tag old')).toBeNull();
    fireEvent.click(screen.getByLabelText('Tag new'));
    expect(
      within(screen.getByRole('list', { name: 'Selected tags' })).getByText('#new'),
    ).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Selected lessons' })).toBeTruthy();
    expect(axios.post).not.toHaveBeenCalled();
  });
  it('disables preview without a selection', () => {
    render(<BulkLessonTags {...props} selectedIds={[]} />);
    chooseTag();
    expect(screen.getByText('Add selected tags').disabled).toBe(true);
  });
  it('previews server snapshots before applying and refreshes after success', async () => {
    render(<BulkLessonTags {...props} />);
    chooseTag();
    fireEvent.click(screen.getByText('Add selected tags'));
    await screen.findByText('Confirm bulk tag changes');
    expect(screen.getByText('Before: #old')).toBeTruthy();
    expect(screen.getByText('After: #old, #new')).toBeTruthy();
    expect(axios.post).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Confirm adding tags'));
    await waitFor(() => expect(props.onRefresh).toHaveBeenCalled());
    expect(axios.post).toHaveBeenLastCalledWith('/api/bm/lessons/bulk-tags', {
      lessonIds: ['lesson1'],
      tags: ['new'],
      operation: 'add',
      expected: [{ lessonId: 'lesson1', tags: ['old'] }],
    });
    expect(props.setSelectedIds).toHaveBeenCalledWith([]);
  });
  it('cancels without applying', async () => {
    render(<BulkLessonTags {...props} />);
    chooseTag();
    fireEvent.click(screen.getByText('Add selected tags'));
    await screen.findByText('Confirm bulk tag changes');
    fireEvent.click(screen.getByText('Cancel'));
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
  it('shows backend conflicts and retains selection', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Refresh the preview.' } } });
    render(<BulkLessonTags {...props} />);
    chooseTag();
    fireEvent.click(screen.getByText('Add selected tags'));
    await screen.findByRole('alert');
    expect(screen.getByText('Refresh the preview.')).toBeTruthy();
    expect(props.setSelectedIds).not.toHaveBeenCalled();
  });
  it('disables confirmation for no-op previews', async () => {
    axios.post.mockResolvedValue({ data: { changes: [{ ...changes[0], after: ['old'] }] } });
    render(<BulkLessonTags {...props} darkMode />);
    chooseTag();
    fireEvent.click(screen.getByText('Add selected tags'));
    await screen.findByText('Confirm bulk tag changes');
    expect(screen.getByText('Confirm adding tags').disabled).toBe(true);
    expect(screen.getByText('No change needed')).toBeTruthy();
  });

  it('sends removal as a distinct bulk action', async () => {
    render(<BulkLessonTags {...props} />);
    chooseTag();
    fireEvent.click(screen.getByText('Remove selected tags'));
    await screen.findByText('Confirm bulk tag changes');
    expect(axios.post).toHaveBeenCalledWith('/api/bm/lessons/bulk-tags/preview', {
      lessonIds: ['lesson1'],
      tags: ['new'],
      operation: 'remove',
    });
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Safety', { exact: true })).toBeTruthy();
    expect(within(dialog).getByText('#new', { exact: true })).toBeTruthy();
    expect(within(dialog).getByText('Confirm removing tags')).toBeTruthy();
  });

  it('shows full selected titles with individual deselection controls', () => {
    const title = 'A full lesson title that must remain visible';
    render(
      <BulkLessonTags
        {...props}
        selectedIds={['lesson1', 'lesson2']}
        filteredLessons={[
          { _id: 'lesson1', title },
          { _id: 'lesson2', title: 'Tools' },
        ]}
      />,
    );
    const selected = screen.getByRole('list', { name: 'Selected lessons' });
    expect(within(selected).getByText(title)).toBeTruthy();
    expect(within(selected).getByText('Tools')).toBeTruthy();
    fireEvent.click(within(selected).getByRole('button', { name: `Deselect lesson ${title}` }));
    const update = props.setSelectedIds.mock.calls[0][0];
    expect(update(['lesson1', 'lesson2'])).toEqual(['lesson2']);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('keeps both actions disabled when no tags are chosen', () => {
    render(<BulkLessonTags {...props} />);
    expect(screen.getByText('Add selected tags').disabled).toBe(true);
    expect(screen.getByText('Remove selected tags').disabled).toBe(true);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('distinguishes repeated lesson titles using their existing tags', () => {
    render(
      <BulkLessonTags
        {...props}
        selectedIds={['first', 'second']}
        filteredLessons={[
          { _id: 'first', title: 'Tag Storage', tags: ['maths'] },
          { _id: 'second', title: 'Tag Storage', tags: ['#history'] },
        ]}
      />,
    );
    const selection = screen.getByRole('list', { name: 'Selected lessons' });
    expect(within(selection).getAllByText('Tag Storage')).toHaveLength(2);
    expect(within(selection).getByText('#maths')).toBeTruthy();
    expect(within(selection).getByText('#history')).toBeTruthy();
  });

  it('formats tag labels without changing the stored value sent to the API', async () => {
    render(<BulkLessonTags {...props} availableTags={['##lesson']} />);
    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search existing tags' }));
    fireEvent.click(screen.getByLabelText('Tag ##lesson'));
    expect(
      within(screen.getByRole('list', { name: 'Selected tags' })).getByText('#lesson'),
    ).toBeTruthy();
    fireEvent.click(screen.getByText('Add selected tags'));
    await screen.findByText('Confirm bulk tag changes');
    expect(axios.post).toHaveBeenCalledWith('/api/bm/lessons/bulk-tags/preview', {
      lessonIds: ['lesson1'],
      tags: ['##lesson'],
      operation: 'add',
    });
  });

  it('requires confirmation before undoing a historical batch', async () => {
    axios.get.mockResolvedValue({
      data: [
        {
          _id: 'batch1',
          actor: 'user1',
          tags: ['new'],
          operation: 'add',
          createdAt: new Date().toISOString(),
          changes,
        },
      ],
    });
    render(<BulkLessonTags {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'View history' }));
    await screen.findByText('Undo this batch');
    fireEvent.click(screen.getByText('Undo this batch'));
    expect(axios.post).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Confirm undo'));
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith('/api/bm/lessons/bulk-tags/batch1/undo'),
    );
    await waitFor(() => expect(props.onRefresh).toHaveBeenCalled());
  });

  it('selects every displayed record, including Tag Storage', () => {
    render(
      <BulkLessonTags
        {...props}
        filteredLessons={[
          ...props.filteredLessons,
          { _id: 'storage', title: 'Tag Storage', author: { id: '000000000000000000000000' } },
        ]}
      />,
    );
    fireEvent.click(screen.getByLabelText('Select all editable lessons'));
    expect(props.setSelectedIds).toHaveBeenCalledWith(['lesson1', 'lesson2', 'storage']);
  });
});

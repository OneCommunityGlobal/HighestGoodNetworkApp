import { fireEvent, render, screen } from '@testing-library/react';
import {
  getLatestProject,
  SummaryProjectProvider,
  useSummaryProjectSelection,
  useSummaryProjects,
} from '../summaryProjectSelection';
const older = { _id: 'old', name: 'Older', createdAt: '2026-01-01T00:00:00Z' };
const latest = { _id: 'latest', name: 'Latest', updatedAt: '2026-10-01T00:00:00Z' };

function Filter({ id }) {
  const [project, select] = useSummaryProjectSelection(id, '');
  return (
    <select aria-label={id} value={project} onChange={event => select(event.target.value)}>
      <option value="">All Projects</option>
      <option value="old">Older</option>
      <option value="latest">Latest</option>
    </select>
  );
}

describe('project recency', () => {
  it('ranks edits and additions independently of response order', () => {
    expect(getLatestProject([latest, older])).toEqual(latest);
    expect(getLatestProject([older, latest])).toEqual(latest);
    expect(getLatestProject([latest, { ...older, createdAt: '2026-11-01' }])._id).toBe('old');
  });

  it('supports legacy creation metadata and ignores invalid or missing dates', () => {
    const legacy = { _id: 'legacy', dateCreated: '2026-01-01' };
    expect(getLatestProject([{ _id: 'bad', updatedAt: 'invalid' }, legacy])).toEqual(legacy);
    expect(getLatestProject([])).toBeNull();
    expect(getLatestProject([{ _id: 'unknown' }])).toBeNull();
  });

  it('breaks timestamp ties deterministically rather than by list position', () => {
    const a = { ...latest, _id: 'a' };
    const b = { ...latest, _id: 'b' };
    expect(getLatestProject([b, a])).toEqual(a);
    expect(getLatestProject([a, b])).toEqual(a);
  });
});

describe('summary defaults', () => {
  it('waits for project metadata and gives independent charts the same default', () => {
    const { rerender } = render(
      <SummaryProjectProvider projects={[]}>
        <Filter id="first" />
        <Filter id="second" />
      </SummaryProjectProvider>,
    );
    expect(screen.getByLabelText('first')).toHaveValue('');
    rerender(
      <SummaryProjectProvider projects={[older, latest]}>
        <Filter id="first" />
        <Filter id="second" />
      </SummaryProjectProvider>,
    );
    expect(screen.getByLabelText('first')).toHaveValue('latest');
    expect(screen.getByLabelText('second')).toHaveValue('latest');
    fireEvent.change(screen.getByLabelText('first'), { target: { value: 'old' } });
    expect(screen.getByLabelText('first')).toHaveValue('old');
    expect(screen.getByLabelText('second')).toHaveValue('latest');
  });

  it('retains explicit All, including across refreshes and section remounts', () => {
    const { rerender } = render(
      <SummaryProjectProvider projects={[older, latest]}>
        <Filter id="first" />
      </SummaryProjectProvider>,
    );
    fireEvent.change(screen.getByLabelText('first'), { target: { value: '' } });
    rerender(
      <SummaryProjectProvider projects={[{ ...older, updatedAt: '2026-12-01' }, latest]}>
        <span>Collapsed</span>
      </SummaryProjectProvider>,
    );
    rerender(
      <SummaryProjectProvider projects={[{ ...older, updatedAt: '2026-12-01' }, latest]}>
        <Filter id="first" />
        <Filter id="late" />
      </SummaryProjectProvider>,
    );
    expect(screen.getByLabelText('first')).toHaveValue('');
    expect(screen.getByLabelText('late')).toHaveValue('latest');
  });

  it('does not overwrite a choice made before metadata arrives', () => {
    const { rerender } = render(
      <SummaryProjectProvider projects={[]}>
        <Filter id="first" />
      </SummaryProjectProvider>,
    );
    fireEvent.change(screen.getByLabelText('first'), { target: { value: 'old' } });
    rerender(
      <SummaryProjectProvider projects={[latest, older]}>
        <Filter id="first" />
      </SummaryProjectProvider>,
    );
    expect(screen.getByLabelText('first')).toHaveValue('old');
  });

  it('leaves standalone chart behavior unchanged', () => {
    render(<Filter id="standalone" />);
    expect(screen.getByLabelText('standalone')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('standalone'), { target: { value: 'old' } });
    expect(screen.getByLabelText('standalone')).toHaveValue('old');
  });
});

function ProjectOptions() {
  const projects = useSummaryProjects([{ _id: 'general', projectName: 'General project' }]);
  return <div>{projects.map(project => project._id).join(',')}</div>;
}

it('retains original options from other project collections alongside the BM default', () => {
  render(
    <SummaryProjectProvider projects={[latest]}>
      <ProjectOptions />
    </SummaryProjectProvider>,
  );
  expect(screen.getByText('latest,general')).toBeInTheDocument();
});

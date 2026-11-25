import { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Table } from 'reactstrap';
import MemberSearchInput, { HighlightMatch } from './MemberSearchInput';
import { EMPTY_FILTERS, MEMBER_COLUMNS, filterMembers, getMemberOptions } from './memberSearch';
import styles from './ProjectLog.module.css';
const DummyData = [
  {
    id: '12',
    firstName: 'Dora',
    lastName: 'Kimberly',
    role: 'Carpenter',
    team: 'XYZ',
    currentTask: 'Stud wall construction',
    totalHrs: 169,
    todaysHrs: 5.5,
  },
  {
    id: '35',
    firstName: 'Cailin',
    lastName: 'Colby',
    role: 'Volunteer',
    team: 'Team A',
    currentTask: 'Foundation concreting',
    totalHrs: 15,
    todaysHrs: 2.18,
  },
  {
    id: '36',
    firstName: 'Member A',
    lastName: 'Member A',
    role: 'Role A',
    team: 'Team A',
    currentTask: 'Task 1',
    totalHrs: 169,
    todaysHrs: 5.5,
  },
];

// Keep the potentially large table body unchanged while the user types.
const MemberRows = memo(function MemberRows({ members, filters }) {
  return (
    <tbody>
      {members.length ? (
        members.map(person => (
          <tr key={person.id}>
            {MEMBER_COLUMNS.map(({ key }) => {
              const content = <HighlightMatch value={person[key]} query={filters[key]} />;
              return key === 'id' ? (
                <th key={key} scope="row">
                  {content}
                </th>
              ) : (
                <td key={key}>{content}</td>
              );
            })}
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={MEMBER_COLUMNS.length}>No members match these filters.</td>
        </tr>
      )}
    </tbody>
  );
});

MemberRows.propTypes = {
  members: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
};

function ProjectLog({ members = DummyData, darkMode = false }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const options = useMemo(
    () =>
      Object.fromEntries(
        MEMBER_COLUMNS.map(column => [
          column.key,
          column.suggest ? getMemberOptions(members, column.key) : [],
        ]),
      ),
    [members],
  );
  const filtered = useMemo(() => filterMembers(members, appliedFilters), [members, appliedFilters]);

  useEffect(() => {
    if (filters === appliedFilters) return undefined;
    const timer = setTimeout(() => setAppliedFilters(filters), 350);
    return () => clearTimeout(timer);
  }, [filters, appliedFilters]);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };

  return (
    <Card className={`${styles.projectLog} ${darkMode ? styles.dark : ''}`}>
      <h2>Members working on site today</h2>
      <div className={styles.toolbar}>
        <output>
          Showing {filtered.length} of {members.length} members
        </output>
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearFilters}
          disabled={!Object.values(filters).some(Boolean)}
        >
          Clear All Filters
        </button>
      </div>
      <fieldset className={styles.filters}>
        <legend className={styles.filtersLegend}>Filter members</legend>
        {MEMBER_COLUMNS.map(column => (
          <MemberSearchInput
            key={column.key}
            column={column}
            value={filters[column.key]}
            options={options[column.key]}
            onChange={value => setFilters(previous => ({ ...previous, [column.key]: value }))}
            onSelect={value => {
              const next = { ...filters, [column.key]: value };
              setFilters(next);
              setAppliedFilters(next);
            }}
          />
        ))}
      </fieldset>
      <Table hover responsive striped className={styles.membersTable}>
        <caption className={styles.caption}>
          Members working on site today, filtered by the fields above
        </caption>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Team</th>
            <th>Current Task</th>
            <th>Total Hrs</th>
            <th>Today&apos;s Hrs</th>
          </tr>
        </thead>
        <MemberRows members={filtered} filters={appliedFilters} />
      </Table>
    </Card>
  );
}

ProjectLog.propTypes = { members: PropTypes.arrayOf(PropTypes.object), darkMode: PropTypes.bool };

export default ProjectLog;

import styles from './style.module.css';

/*
  Shared column widths for the Team Member Tasks table.

  The header (TeamMemberTasks) and every member row (TeamMemberTask) are separate
  6-column tables under `table-layout: fixed`. Without the same colgroup in both,
  the row table splits its columns by colSpan (1/6, 2/6, 3/6), so its left block
  is 50% wide while the header's is 35%, and the Task(s) / Progress / Status
  cells drift right of their headers and overflow the panel.

  Left block (35%): User Status (one column), then Team Member (two columns),
  the same 1/3 : 2/3 split as .header-col-status / .header-col-member.
  Right block (65%): Task(s), Progress and Status.
*/
function TaskTableColgroup() {
  return (
    <colgroup className={styles['task-colgroup']}>
      <col data-testid="task-table-col" style={{ width: '11.67%' }} />
      <col data-testid="task-table-col" style={{ width: '11.67%' }} />
      <col data-testid="task-table-col" style={{ width: '11.66%' }} />
      <col data-testid="task-table-col" style={{ width: '21.67%' }} />
      <col data-testid="task-table-col" style={{ width: '21.67%' }} />
      <col data-testid="task-table-col" style={{ width: '21.66%' }} />
    </colgroup>
  );
}

export default TaskTableColgroup;

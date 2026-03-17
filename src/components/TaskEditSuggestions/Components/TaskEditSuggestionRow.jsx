import { datetimeToDate } from '../../TeamMemberTasks/components/TaskDifferenceModal';

// eslint-disable-next-line import/prefer-default-export
export function TaskEditSuggestionRow({
  taskEditSuggestion,
  handleToggleTaskEditSuggestionModal,
  darkMode,
}) {
  const handleButtonClick = event => {
    event.stopPropagation(); // This stops the click event from bubbling up to the parent <tr>
    handleToggleTaskEditSuggestionModal(taskEditSuggestion);
  };

  return (
    <tr
      onClick={() => handleToggleTaskEditSuggestionModal(taskEditSuggestion)}
      className={darkMode ? 'text-light' : ''}
    >
      <td>{datetimeToDate(taskEditSuggestion.dateSuggested)}</td>
      <td>{taskEditSuggestion.user}</td>
      <td>{taskEditSuggestion.oldTask.taskName}</td>
      <td>
        <button
          type="button"
          onClick={handleButtonClick}
          style={{
            backgroundColor: '#007bff',
            borderRadius: '5px',
            padding: '5px 10px',
            color: 'white',
          }}
        >
          View Suggestion
        </button>
      </td>
    </tr>
  );
}

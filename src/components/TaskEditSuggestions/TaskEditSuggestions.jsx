import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table } from 'reactstrap';
import Loading from '../common/Loading';
import { TaskEditSuggestionRow } from './Components/TaskEditSuggestionRow';
import { TaskEditSuggestionsModal } from './Components/TaskEditSuggestionsModal';
import { getTaskEditSuggestionsData } from './selectors';
import { toggleDateSuggestedSortDirection, toggleUserSortDirection } from './actions';

function SortArrow({ sortDirection }) {
  if (sortDirection === 'asc') {
    return <i className="fa fa-arrow-up" />;
  }
  if (sortDirection === 'desc') {
    return <i className="fa fa-arrow-down" />;
  }
}

export default function TaskEditSuggestions() {
  const [isTaskEditSuggestionModalOpen, setIsTaskEditSuggestionModalOpen] = useState(false);
  const [currentTaskEditSuggestion, setCurrentTaskEditSuggestion] = useState();

  const {
    isLoading,
    taskEditSuggestions,
    userSortDirection,
    dateSuggestedSortDirection,
  } = useSelector(getTaskEditSuggestionsData);

  const dispatch = useDispatch();

  const handleToggleTaskEditSuggestionModal = currTaskEditSug => {
    setCurrentTaskEditSuggestion(currTaskEditSug);
    setIsTaskEditSuggestionModalOpen(!isTaskEditSuggestionModalOpen);
  };
  return (
    <Container>
      <h1 className="mt-3">Task Edit Suggestions</h1>
      {/* {isUserPermitted ? <h1>Task Edit Suggestions</h1> : <h1>{userRole} is not permitted to view this</h1>} */}
      {isLoading && <Loading />}
      {!isLoading && taskEditSuggestions && (
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th onClick={() => dispatch(toggleDateSuggestedSortDirection())}>
                  Date Suggested <SortArrow sortDirection={dateSuggestedSortDirection} />
                </th>
                <th onClick={() => dispatch(toggleUserSortDirection())}>
                  User <SortArrow sortDirection={userSortDirection} />
                </th>
                <th>Task</th>
                {/* <th /> */}
              </tr>
            </thead>
            <tbody>
              {taskEditSuggestions.map(taskEditSuggestion => (
                <TaskEditSuggestionRow
                  key={taskEditSuggestion._id}
                  taskEditSuggestion={taskEditSuggestion}
                  handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
                />
              ))}
            </tbody>
          </Table>
        </div>
      )}
      <TaskEditSuggestionsModal
        isTaskEditSuggestionModalOpen={isTaskEditSuggestionModalOpen}
        taskEditSuggestion={currentTaskEditSuggestion}
        handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
      />
    </Container>
  );
}

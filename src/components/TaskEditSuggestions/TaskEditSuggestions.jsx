import Loading from 'components/common/Loading';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Container, Table } from 'reactstrap';
import { TaskEditSuggestionRow } from './Components/TaskEditSuggestionRow';
import { TaskEditSuggestionsModal } from './Components/TaskEditSuggestionsModal';
import { getTaskEditSuggestionsData } from './selectors';
import { fetchTaskEditSuggestions } from './thunks';
import { toggleDateSuggestedSortDirection, toggleUserSortDirection } from './actions';
import hasPermission from 'utils/permissions';

export const TaskEditSuggestions = () => {
  const [isTaskEditSuggestionModalOpen, setIsTaskEditSuggestionModalOpen] = useState(false);
  const [currentTaskEditSuggestion, setCurrentTaskEditSuggestion] = useState();

  const {
    isLoading,
    taskEditSuggestions,
    userSortDirection,
    dateSuggestedSortDirection,
    userRole,
  } = useSelector(getTaskEditSuggestionsData);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTaskEditSuggestions());
  }, []);

  const handleToggleTaskEditSuggestionModal = currentTaskEditSuggestion => {
    setCurrentTaskEditSuggestion(currentTaskEditSuggestion);
    setIsTaskEditSuggestionModalOpen(!isTaskEditSuggestionModalOpen);
  };

  const SortArrow = ({ sortDirection }) => {
    if (sortDirection === 'asc') {
      return <i class="fa fa-arrow-up"></i>;
    } else if (sortDirection === 'desc') {
      return <i class="fa fa-arrow-down"></i>;
    } else {
      return <></>;
    }
  };

  return (
    <Container>
      <h1 className='mt-3'>Task Edit Suggestions</h1>
      {/* {isUserPermitted ? <h1>Task Edit Suggestions</h1> : <h1>{userRole} is not permitted to view this</h1>} */}
      {isLoading && <Loading />}
      {!isLoading && taskEditSuggestions && (
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
      )}
      <TaskEditSuggestionsModal
        isTaskEditSuggestionModalOpen={isTaskEditSuggestionModalOpen}
        taskEditSuggestion={currentTaskEditSuggestion}
        handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
      />
    </Container>
  );
};

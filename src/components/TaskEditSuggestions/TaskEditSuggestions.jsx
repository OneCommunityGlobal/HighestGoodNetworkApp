import "./TaskEditSuggestions.css"
import Loading from 'components/common/Loading';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Container, Table } from 'reactstrap';
import { FaUndoAlt } from 'react-icons/fa';
import { TaskEditSuggestionRow } from './Components/TaskEditSuggestionRow';
import { TaskEditSuggestionsModal } from './Components/TaskEditSuggestionsModal';
import { getTaskEditSuggestionsData } from './selectors';
import { toggleDateSuggestedSortDirection, toggleUserSortDirection } from './actions';
import { fetchTaskEditSuggestions } from './thunks';

export const TaskEditSuggestions = () => {
  const [isTaskEditSuggestionModalOpen, setIsTaskEditSuggestionModalOpen] = useState(false);
  const [currentTaskEditSuggestion, setCurrentTaskEditSuggestion] = useState();

  const {
    isLoading,
    taskEditSuggestions,
    userSortDirection,
    dateSuggestedSortDirection,
    userRole,
    darkMode
  } = useSelector(getTaskEditSuggestionsData);

  const dispatch = useDispatch();

  const handleToggleTaskEditSuggestionModal = currentTaskEditSuggestion => {
    setCurrentTaskEditSuggestion(currentTaskEditSuggestion);
    setIsTaskEditSuggestionModalOpen(!isTaskEditSuggestionModalOpen);
  };

  const handleLoadTaskEditSuggestions = () => {
    dispatch(fetchTaskEditSuggestions());
  }

  const SortArrow = ({ sortDirection }) => {
    if (sortDirection === 'asc') {
      return <i className="fa fa-arrow-up"></i>;
    } else if (sortDirection === 'desc') {
      return <i className="fa fa-arrow-down"></i>;
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    handleLoadTaskEditSuggestions();
  }, [])

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: "100%" }}>
      <Container>
        <div className='task-edit-suggestions-title'>
          <h1>Task Edit Suggestions</h1>
          <button type='button' title='Refresh' onClick={handleLoadTaskEditSuggestions}>
            <FaUndoAlt size={20} className={darkMode ? 'text-light' : ''} />
          </button>
        </div>
        {/* {isUserPermitted ? <h1>Task Edit Suggestions</h1> : <h1>{userRole} is not permitted to view this</h1>} */}
        {isLoading && <Loading />}
        {!isLoading && taskEditSuggestions && (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead className={darkMode ? 'text-light' : ''}>
                <tr>
                  <th onClick={() => dispatch(toggleDateSuggestedSortDirection())}>
                    Date Suggested <SortArrow sortDirection={dateSuggestedSortDirection} />
                  </th>
                  <th onClick={() => dispatch(toggleUserSortDirection())}>
                    User <SortArrow sortDirection={userSortDirection} />
                  </th>
                  <th>Task</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {taskEditSuggestions.map(taskEditSuggestion => (
                  <TaskEditSuggestionRow
                    key={taskEditSuggestion._id}
                    taskEditSuggestion={taskEditSuggestion}
                    handleToggleTaskEditSuggestionModal={handleToggleTaskEditSuggestionModal}
                    darkMode={darkMode}
                    userRole={userRole}
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
          userRole={userRole}
        />
      </Container>
    </div>
  );
};

import PropTypes from 'prop-types';

export const taskShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  _id: PropTypes.string,
  course_name: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
});

export const taskItemPropTypes = {
  task: taskShape.isRequired,
  onMarkAsDone: PropTypes.func,
  onLogTime: PropTypes.func,
  intermediateTasks: PropTypes.arrayOf(PropTypes.shape({})),
  isExpanded: PropTypes.bool,
  onToggleIntermediateTasks: PropTypes.func,
  onMarkIntermediateAsDone: PropTypes.func,
  darkMode: PropTypes.bool,
};

export const taskItemDefaultProps = {
  onMarkAsDone: undefined,
  onLogTime: undefined,
  intermediateTasks: [],
  isExpanded: false,
  onToggleIntermediateTasks: undefined,
  onMarkIntermediateAsDone: undefined,
  darkMode: false,
};

export const taskViewPropTypes = {
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  onMarkAsDone: PropTypes.func,
  onLogTime: PropTypes.func,
  intermediateTasks: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({}))),
  expandedTasks: PropTypes.objectOf(PropTypes.bool),
  onToggleIntermediateTasks: PropTypes.func,
  onMarkIntermediateAsDone: PropTypes.func,
  darkMode: PropTypes.bool,
};

export const taskViewDefaultProps = {
  onMarkAsDone: undefined,
  onLogTime: undefined,
  intermediateTasks: {},
  expandedTasks: {},
  onToggleIntermediateTasks: undefined,
  onMarkIntermediateAsDone: undefined,
  darkMode: false,
};

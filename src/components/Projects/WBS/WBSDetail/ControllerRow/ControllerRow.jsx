import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from 'reactstrap';
import AddTaskModal from '../AddTask';
import EditTaskModal from '../EditTask';
import {
  moveTasks,
  deleteTask,
  emptyTaskItems,
  deleteChildrenTasks,
} from '../../../../../actions/task.js';
import ModalDelete from './../../../../../components/common/Modal';
import * as Message from './../../../../../languages/en/messages';
import { getPopupById } from './../../../../../actions/popupEditorAction';
import { TASK_DELETE_POPUP_ID } from './../../../../../constants/popupId';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';

function ControllerRow(props) {
  /*
  * -------------------------------- variable declarations --------------------------------
  */
  // permissions
  const canDeleteTask = props.hasPermission('deleteTask');
  const canPostTask = props.hasPermission('postTask');

  // props from store
  const { role, userPermissions, roles, popupContent, darkMode } = props;

  // states from hooks
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  const { currentTask, copyCurrentTask } = props;
  /*
  * -------------------------------- functions --------------------------------
  */
  const showUpDeleteModal = () => {
    setModalDelete(true);
    props.getPopupById(TASK_DELETE_POPUP_ID);
  };

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const onMove = async (from, to) => {
    await props.moveTasks(props.wbsId, from, to);
    props.load();
  };

  const onCopy = () => {
    setIsCopied(true);
    copyCurrentTask(currentTask);
  };

  const deleteTask = async (taskId, mother) => {
    await props.deleteTask(taskId, mother);
    await props.emptyTaskItems();
    await props.load();
  };

  /*
  * -------------------------------- JSX rendering --------------------------------
  */
  return (
    <tr className="wbsTaskController" id={`controller_${props.taskId}`}>
      <td colSpan={props.tableColNum} className={`controlTd ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="task-action-buttons">
          {props.level < 4 && canPostTask ? (
            <AddTaskModal
              label={"Add Subtask"}
              key={`addTask_${props.taskId}`}
              taskNum={props.num}
              taskId={props.taskId}
              projectId={props.projectId}
              wbsId={props.wbsId}
              parentId1={props.parentId1}
              parentId2={props.parentId2}
              parentId3={props.parentId3}
              mother={props.mother}
              childrenQty={props.childrenQty}
              level={props.level}
              load={props.load}
              pageLoadTime={props.pageLoadTime}
              isOpen={props.isOpen}
              setIsOpen={props.setIsOpen}
            />
          ) : null}
          <EditTaskModal
            key={`editTask_${props.taskId}`}
            parentNum={props.num}
            taskId={props.taskId}
            projectId={props.projectId}
            wbsId={props.wbsId}
            parentId1={props.parentId1}
            parentId2={props.parentId2}
            parentId3={props.parentId3}
            mother={props.mother}
            level={props.level}
            load={props.load}
          />
         
          {canDeleteTask && (
            <Button
              color="danger"
              size="sm"
              className="controlBtn"
              onClick={showUpDeleteModal}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Remove
            </Button>
          )}

          <Dropdown direction="up" isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret color="primary" className="controlBtn" size="sm" style={darkMode ? boxStyleDark : boxStyle}>
              Move
            </DropdownToggle>
            <DropdownMenu>
              {props.siblings.map((item, i) => {
                if (item.num !== props.num) {
                  return (
                    <DropdownItem key={i} onClick={e => onMove(props.num, item.num)}>
                      {item.num.split('.0')[0]}
                    </DropdownItem>
                  );
                }
              })}
            </DropdownMenu>
          </Dropdown>

          <Button
            color="secondary"
            size="sm"
            className="controlBtn"
            onClick={() => onCopy(props.taskId)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        <ModalDelete
          isOpen={canDeleteTask && modalDelete}
          closeModal={() => setModalDelete(false)}
          confirmModal={() => deleteTask(props.taskId, props.mother)}
          modalMessage={popupContent || ''}
          modalTitle={Message.CONFIRM_DELETION}
          darkMode={darkMode}
        />
      </td>
    </tr>
  );
}

const mapStateToProps = state => ({
  role: state.auth ? state.auth.user.role : null,
  userPermissions: state.auth.user?.permissions?.frontPermissions,
  roles: state.role.roles,
  popupContent: state.popupEditor.currPopup.popupContent,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  moveTasks,
  deleteTask,
  emptyTaskItems,
  getPopupById,
  deleteChildrenTasks,
  hasPermission,
})(ControllerRow);

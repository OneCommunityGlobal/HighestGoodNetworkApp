import React, { useRef, useEffect, useState } from 'react';
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
  copyTask,
  deleteChildrenTasks,
} from '../../../../../actions/task.js';
import ModalDelete from './../../../../../components/common/Modal';
import * as Message from './../../../../../languages/en/messages';
import { getPopupById } from './../../../../../actions/popupEditorAction';
import { TASK_DELETE_POPUP_ID } from './../../../../../constants/popupId';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import {permissions} from 'utils/constants'


function ControllerRow (props) {
  /*
  * -------------------------------- variable declarations --------------------------------
  */
  // permissions
  const canDeleteTask = props.hasPermission(permissions.projects.deleteTask);
  const canPostTask = props.hasPermission(permissions.projects.postTask);

  // props from store
  const { role, userPermissions, roles, popupContent } = props;

  // states from hooks
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);


  /*
  * -------------------------------- functions --------------------------------
  */
  const showUpDeleteModal = () => {
    setModalDelete(true);
    props.getPopupById(TASK_DELETE_POPUP_ID);
  };

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const onMove = async (from, to) => {
    props.setIsLoading(true);
    await props.moveTasks(props.wbsId, from, to);
    props.load();
    props.setIsLoading(false);
  };

  const onCopy = id => {
    setIsCopied(true);
    props.copyTask(id);
  };

  const deleteTask = async (taskId, mother) => {
    props.setIsLoading(true);
    await props.deleteTask(taskId, mother);
    await props.emptyTaskItems();
    await props.load();
    props.setIsLoading(false);
  };

  /*
  * -------------------------------- useEffects --------------------------------
  */

  return (
    <tr className="wbsTaskController desktop-view" id={`controller_${props.taskId}`}>
      <td colSpan={props.tableColNum} className="controlTd">
        {props.level < 4 && canPostTask ? (
          <AddTaskModal
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
          setIsLoading={props.setIsLoading}
        />
        {canDeleteTask ? (
          <>
            <Button
              color="danger"
              size="sm"
              className="controlBtn"
              onClick={showUpDeleteModal}
              style={boxStyle}
            >
              Remove
            </Button>

            <Dropdown
              direction="up"
              isOpen={dropdownOpen}
              toggle={toggle}
              style={{ ...boxStyle, float: 'left' }}
            >
              <DropdownToggle caret color="primary" className='controlBtn' size="sm">
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
              style={boxStyle}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </>
        ) : null}
        <ModalDelete
          isOpen={modalDelete}
          closeModal={() => {
            setModalDelete(false);
          }}
          confirmModal={() => deleteTask(props.taskId, props.mother)}
          modalMessage={popupContent || ''}
          modalTitle={Message.CONFIRM_DELETION}
        />
      </td>
    </tr>
  )
}

const mapStateToProps = state => ({
  role: state.auth ? state.auth.user.role : null,
  userPermissions: state.auth.user?.permissions?.frontPermissions,
  roles: state.role.roles,
  popupContent: state.popupEditor.currPopup.popupContent,
});

export default connect(mapStateToProps, {
  moveTasks,
  deleteTask,
  emptyTaskItems,
  copyTask,
  getPopupById,
  deleteChildrenTasks,
  hasPermission,
})(ControllerRow);


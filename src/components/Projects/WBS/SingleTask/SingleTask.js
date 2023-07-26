import React, { useState, useEffect } from 'react';

import { connect, useSelector } from 'react-redux';

import ReactTooltip from 'react-tooltip';
import axios from 'axios';
import { NavItem, Button } from 'reactstrap';
import { Modal, ModalBody } from 'reactstrap';
import { Editor } from '@tinymce/tinymce-react';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from 'utils/URL';
import { getUserProfile } from 'actions/userProfile';
import EditTaskModal from '../WBSDetail/EditTask/EditTaskModal';
import hasPermission from 'utils/permissions';
import ModalDelete from '../../../common/Modal';
import { deleteTask } from '../../../../actions/task';
import * as Message from '../../../../languages/en/messages';
import { getPopupById } from '../../../../actions/popupEditorAction';
import { TASK_DELETE_POPUP_ID } from '../../../../constants/popupId';
import { useHistory } from 'react-router-dom';

const SingleTask = props => {
  const taskId = props.match.params.taskId;
  const { user } = props.auth;
  const userPermissions = props.auth.user?.permissions?.frontPermissions;
  const roles = useSelector(state => state.role.roles);
  const [task, setTask] = useState({});
  const [modal, setModal] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const toggleModel = () => setModal(!modal);

  const history = useHistory();
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(taskId));
        setTask(res?.data || {});
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskData();
  }, []);

  const deleteTask = (taskId, taskMother) => {
    props.deleteTask(taskId, taskMother);
    setTask({});
    setModalDelete(false);
    history.push('/dashboard');
  };

  const showUpDeleteModal = () => {
    setModalDelete(true);
    props.getPopupById(TASK_DELETE_POPUP_ID);
  };

  return (
    <React.Fragment>
      <ReactTooltip />
      <div className="container-single-task">
        {hasPermission(user.role, 'seeProjectManagement', roles, userPermissions) && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <NavItem tag={Link} to={`/wbs/samefoldertasks/${taskId}`}>
                <Button type="button" className="btn btn-secondary">
                  <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
                </Button>
              </NavItem>
              <div id="single_task_name">See tasks in the same folder as "{task.taskName}"</div>
            </ol>
          </nav>
        )}

        <React.Fragment>
          <table className="table table-bordered tasks-table">
            <thead>
              <tr>
                <th scope="col" data-tip="Action" colSpan="1">
                  Action
                </th>
                <th scope="col" data-tip="task-num" colSpan="1">
                  #
                </th>
                <th scope="col" data-tip="Task Name" className="task-name">
                  Task Name
                </th>
                <th scope="col" data-tip="Priority">
                  <i className="fa fa-star" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Resources">
                  <i className="fa fa-users" aria-hidden="true"></i>
                </th>
                <th scope="col" data-tip="Assigned">
                  <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Status">
                  <i className="fa fa-tasks" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Hours-Best">
                  <i className="fa fa-hourglass-start" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Hours-Worst">
                  <i className="fa fa-hourglass" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Hours-Most">
                  <i className="fa fa-hourglass-half" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Estimated Hours">
                  <i className="fa fa-clock-o" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Hours-Logged">
                  <i className="fa fa-hourglass-end" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Start Date">
                  <i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start
                </th>
                <th className="desktop-view" scope="col" data-tip="Due Date">
                  <i className="fa fa-calendar-times-o" aria-hidden="true"></i> End
                </th>
                <th className="desktop-view" scope="col" data-tip="Links">
                  <i className="fa fa-link" aria-hidden="true"></i>
                </th>
                <th className="desktop-view" scope="col" data-tip="Details">
                  <i className="fa fa-question" aria-hidden="true"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  <EditTaskModal
                    key={`editTask_${task._id}`}
                    parentNum={task.num}
                    taskId={task._id}
                    wbsId={task.wbsId}
                    parentId1={task.parentId1}
                    parentId2={task.parentId2}
                    parentId3={task.parentId3}
                    mother={task.mother}
                    level={task.level}
                  />
                  {user.role === "Volunteer" ? ("") : (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="btn btn-danger"
                        onClick={() => showUpDeleteModal()}
                      >
                        Delete <i className="fa fa-trash" aria-hidden="true"></i>
                      </Button>
                      <ModalDelete
                        isOpen={modalDelete}
                        closeModal={() => setModalDelete(false)}
                        confirmModal={() => deleteTask(task._id, task.mother)}
                        modalMessage={props.popupEditor.currPopup.popupContent || 'DELETE THIS TASK ?'}
                        modalTitle={Message.CONFIRM_DELETION}
                      />
                    </>
                  )}
                </th>
                <th scope="row">{task.num}</th>
                <td>{task.taskName}</td>
                <td>{task.priority}</td>
                <td className="desktop-view">
                  {task?.resources &&
                    task.resources.map((elem, i) => {
                      try {
                        if (elem.profilePic) {
                          return (
                            <a
                              key={`res_${i}`}
                              data-tip={elem.name}
                              className="name"
                              href={`/userprofile/${elem.userID}`}
                              target="_blank"
                            >
                              <img className="img-circle" src={elem.profilePic} />
                            </a>
                          );
                        } else {
                          return (
                            <a
                              key={`res_${i}`}
                              data-tip={elem.name}
                              className="name"
                              href={`/userprofile/${elem.userID}`}
                              target="_blank"
                            >
                              <span className="dot">{elem.name.substring(0, 2)}</span>
                            </a>
                          );
                        }
                      } catch (err) { }
                    })}
                </td>
                <td>
                  {task.isAssigned ? (
                    <i data-tip="Assigned" className="fa fa-check-square" aria-hidden="true"></i>
                  ) : (
                    <i data-tip="Not Assigned" className="fa fa-square-o" aria-hidden="true"></i>
                  )}
                </td>
                <td>{task.status}</td>
                <td>{task.hoursBest}</td>
                <td>{task.hoursWorst}</td>
                <td>{task.hoursMost}</td>
                <td>{parseFloat(task.estimatedHours).toFixed(2)}</td>
                <td>{parseFloat(task.hoursLogged).toFixed(2)}</td>
                <td>{task.startedDatetime ? task.startedDatetime.slice(0, 10) : 'N/A'}</td>
                <td>{task.dueDatetime ? task.dueDatetime.slice(0, 10) : 'N/A'}</td>
                <td>{task.links}</td>
                <td className="desktop-view" onClick={toggleModel}>
                  <i className="fa fa-book" aria-hidden="true"></i>
                </td>
              </tr>
            </tbody>
          </table>
        </React.Fragment>
      </div>

      <Modal isOpen={modal} toggle={toggleModel}>
        <ModalBody>
          <h6>WHY THIS TASK IS IMPORTANT:</h6>
          <Editor
            init={{
              menubar: false,
              toolbar: false,
              branding: false,
              min_height: 80,
              max_height: 300,
              autoresize_bottom_margin: 1,
            }}
            disabled={true}
            value={task.whyInfo}
          />

          <h6>THE DESIGN INTENT:</h6>
          <Editor
            init={{
              menubar: false,
              toolbar: false,
              branding: false,
              min_height: 80,
              max_height: 300,
              autoresize_bottom_margin: 1,
            }}
            disabled={true}
            value={task.intentInfo}
          />

          <h6>ENDSTATE:</h6>
          <Editor
            init={{
              menubar: false,
              toolbar: false,
              branding: false,
              min_height: 80,
              max_height: 300,
              autoresize_bottom_margin: 1,
            }}
            disabled={true}
            value={task.endstateInfo}
          />
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};
const mapStateToProps = state => state;
export default connect(mapStateToProps, {
  getUserProfile,
  deleteTask,
  getPopupById,
})(SingleTask);

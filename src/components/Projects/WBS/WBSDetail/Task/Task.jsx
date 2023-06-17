import React, { createRef, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from 'reactstrap';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';
import AddTaskModal from '../AddTask/AddTaskModal';
import EditTaskModal from '../EditTask/EditTaskModal';
import {
  moveTasks,
  fetchAllTasks,
  deleteTask,
  copyTask,
  deleteChildrenTasks,
} from '../../../../../actions/task.js';
import './tagcolor.css';
import './task.css';
import { Editor } from '@tinymce/tinymce-react';
import ModalDelete from './../../../../../components/common/Modal';
import * as Message from './../../../../../languages/en/messages';
import { getPopupById } from './../../../../../actions/popupEditorAction';
import { TASK_DELETE_POPUP_ID } from './../../../../../constants/popupId';
import hasPermission from 'utils/permissions';
import ReactTooltip from 'react-tooltip';

function Task(props) {
  const [role] = useState(props.state ? props.state.auth.user.role : null);
  const { roles } = props.state.role;
  const userPermissions = props.state.auth.user?.permissions?.frontPermissions;
  useEffect(() => {
    setIsCopied(false);
  }, [1]);
  // modal
  const [modal, setModal] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [controllerRow, setControllerRow] = useState(false);
  const toggleModel = () => setModal(!modal);

  const startedDate = new Date(props.startedDatetime);
  const dueDate = new Date(props.dueDatetime);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isCopied, setIsCopied] = useState(false);
  const [tableColNum, setTableColNum] = useState(16);
  const tableRowRef = createRef();

  useEffect(() => {
    if (tableRowRef.current) {
      const spanColNum = tableRowRef.current.cells.length;
      setTableColNum(spanColNum);
    }
  }, []);
  let passCurrentNum = false;

  useEffect(() => {
    if (isOpen !== props.isOpen) {
      setIsOpen(props.isOpen);
    }
  }, [props.isOpen]);

  const toggleGroups = id => {
    if (isOpen) {
      const allItems = [
        ...document.getElementsByClassName(`parentId1_${id}`),
        ...document.getElementsByClassName(`parentId2_${id}`),
        ...document.getElementsByClassName(`parentId3_${id}`),
      ];
      for (let i = 0; i < allItems.length; i++) {
        allItems[i].style.display = 'none';
      }
    } else {
      const allItems = [...document.getElementsByClassName(`mother_${id}`)];
      for (let i = 0; i < allItems.length; i++) {
        allItems[i].style.display = 'table-row';
      }
    }
    setIsOpen(!isOpen);
  };

  const getParentCategory = id => {
    let parentCategory = props.filteredTasks.find(task => task._id === id);
    if (parentCategory) return parentCategory.taskName;
    else return '';
  };

  const openChild = (num, id) => {
    const allItems = document.getElementsByClassName('wbsTask');
    for (let i = 0; i < allItems.length; i++) {
      if (
        allItems[i].className.indexOf(
          `num_${num
            .split('.')
            .join('')
            .replace(/0/g, '')}`,
        ) === 0 &&
        allItems[i].id !== id
      ) {
        allItems[i].style.display = 'table-row';
      }
    }
    setIsOpen(true);
  };

  let toggleMoreResourcesStatus = true;
  const toggleMoreResources = id => {
    if (toggleMoreResourcesStatus) {
      document.getElementById(id).style.display = 'block';
    } else {
      document.getElementById(id).style.display = 'none';
    }
    toggleMoreResourcesStatus = !toggleMoreResourcesStatus;
  };

  const showUpDeleteModal = () => {
    setModalDelete(true);
    props.getPopupById(TASK_DELETE_POPUP_ID);
  };

  const deleteTask = (taskId, mother) => {
    if (mother !== null) {
      props.deleteChildrenTasks(mother);
    }
    props.deleteTask(taskId, mother);
    props.fetchAllTasks(props.wbsId, -1);
    setTimeout(() => {
      props.fetchAllTasks(props.wbsId, 0);
    }, 2000);
  };

  const deleteOneTask = (taskId, mother) => {
    props.deleteWBSTask(taskId, mother);
  };

  const onMove = (from, to) => {
    props.moveTasks(props.wbsId, from, to);
    setTimeout(() => {
      props.fetchAllTasks(props.wbsId);
    }, 4000);
  };

  const onCopy = id => {
    setIsCopied(true);
    props.copyTask(id);
  };
  return (
    <>
      {props.id ? (
        <>
          <ReactTooltip/>
          <tr
            ref={tableRowRef}
            key={props.key}
            className={`num_${props.num?.split('.').join('')} wbsTask  ${
              props.isNew ? 'newTask' : ''
            } parentId1_${props.parentId1} parentId2_${props.parentId2} parentId3_${
              props.parentId3
            } mother_${props.mother} lv_${props.level}`}
            id={props.id}
          >
            <td
              className={`tag_color tag_color_${
                props.num?.length > 0 ? props.num.split('.')[0] : props.num
              } tag_color_lv_${props.level}`}
            ></td>
            <td>
              <Button color="primary" size="sm" onClick={() => setControllerRow(!controllerRow)}>
                <span className="action-edit-btn">EDIT</span>
                {controllerRow ? <BsFillCaretUpFill /> : <BsFillCaretDownFill />}
              </Button>
            </td>
            <td
              id={`r_${props.num}_${props.id}`}
              scope="row"
              className="taskNum"
              onClick={() => {
                /* selectTask(props.id); */
                toggleGroups(props.id);
              }}
            >
              {props.num.split('.0').join('')}
            </td>
            <td className="taskName">
              {props.level === 1 ? (
                <div className="level-space-1" data-tip="Level 1">
                  <span
                    onClick={e => toggleGroups(props.id)}
                    id={`task_name_${props.id}`}
                    className={props.hasChildren ? 'has_children' : ''}
                  >
                    {' '}
                    {props.hasChildren ? (
                      <i
                        data-tip="Not Started"
                        className={`fa fa-folder${isOpen ? '-open' : ''}`}
                        aria-hidden="true"
                      ></i>
                    ) : null}{' '}
                    {props.name}
                  </span>
                </div>
              ) : null}
              {props.level === 2 ? (
                <div className="level-space-2" data-tip="Level 2">
                  <span
                    onClick={e => toggleGroups(props.id)}
                    id={`task_name_${props.id}`}
                    className={props.hasChildren ? 'has_children' : ''}
                  >
                    {' '}
                    {props.hasChildren ? (
                      <i
                        data-tip="Not Started"
                        className={`fa fa-folder${isOpen ? '-open' : ''}`}
                        aria-hidden="true"
                      ></i>
                    ) : null}{' '}
                    {getParentCategory(props.mother) + '/' + props.name}
                  </span>
                </div>
              ) : null}
              {props.level === 3 ? (
                <div className="level-space-3" data-tip="Level 3">
                  <span
                    onClick={e => toggleGroups(props.id)}
                    id={`task_name_${props.id}`}
                    className={props.hasChildren ? 'has_children' : ''}
                  >
                    {' '}
                    {props.hasChildren ? (
                      <i
                        data-tip="Not Started"
                        className={`fa fa-folder${isOpen ? '-open' : ''}`}
                        aria-hidden="true"
                      ></i>
                    ) : null}{' '}
                    {getParentCategory(props.mother) + '/' + props.name}
                  </span>
                </div>
              ) : null}
              {props.level === 4 ? (
                <div className="level-space-4" data-tip="Level 4">
                  <span
                    onClick={e => toggleGroups(props.id)}
                    id={`task_name_${props.id}`}
                    className={props.hasChildren ? 'has_children' : ''}
                  >
                    {' '}
                    {props.hasChildren ? (
                      <i
                        data-tip="Not Started"
                        className={`fa fa-folder${isOpen ? '-open' : ''}`}
                        aria-hidden="true"
                      ></i>
                    ) : null}{' '}
                    {getParentCategory(props.mother) + '/' + props.name}
                  </span>
                </div>
              ) : null}
            </td>
            <td>
              {props.priority === 'Primary' ? (
                <i data-tip="Primary" className="fa fa-star" aria-hidden="true" />
              ) : null}
              {props.priority === 'Secondary' ? (
                <i data-tip="Secondary" className="fa fa-star-half-o" aria-hidden="true" />
              ) : null}
              {props.priority === 'Tertiary' ? (
                <i data-tip="Tertiary" className="fa fa-star-o" aria-hidden="true" />
              ) : null}
            </td>
            <td className="desktop-view">
              {props.resources
                ? props.resources.map((elm, i) => {
                    if (i < 2) {
                      try {
                        if (!elm.profilePic) {
                          return (
                            <a
                              key={`res_${i}`}
                              data-tip={elm.name}
                              className="name"
                              href={`/userprofile/${elm.userID}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="dot">{elm.name.substring(0, 2)}</span>
                            </a>
                          );
                        }
                        return (
                          <a
                            key={`res_${i}`}
                            data-tip={elm.name}
                            className="name"
                            href={`/userprofile/${elm.userID}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img className="img-circle" src={elm.profilePic} />
                          </a>
                        );
                      } catch (err) {}
                    }
                  })
                : null}

              {props.resources.length > 2 ? (
                <a
                  className="name resourceMoreToggle"
                  onClick={() => toggleMoreResources(`res-${props.id}`)}
                >
                  <span className="dot">{props.resources.length - 2}+</span>
                </a>
              ) : null}

              <div id={`res-${props.id}`} className="resourceMore">
                {props.resources
                  ? props.resources.map((elm, i) => {
                      if (i >= 2) {
                        if (!elm.profilePic) {
                          return (
                            <a
                              data-tip={elm.name}
                              className="name"
                              key={i}
                              href={`/userprofile/${elm.userID}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="dot">{elm.name.substring(0, 2)}</span>
                            </a>
                          );
                        }
                        return (
                          <a
                            data-tip={elm.name}
                            className="name"
                            key={i}
                            href={`/userprofile/${elm.userID}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img className="img-circle" src={elm.profilePic} />
                          </a>
                        );
                      }
                    })
                  : null}
              </div>
            </td>
            <td>
              {props.isAssigned ? (
                <i data-tip="Assigned" className="fa fa-check-square" aria-hidden="true" />
              ) : (
                <i data-tip="Not Assigned" className="fa fa-square-o" aria-hidden="true" />
              )}
            </td>
            <td className="desktop-view">
              {props.status === 'Started' || props.status === 'Active' ? (
                <i data-tip="Started" className="fa fa-pause" aria-hidden="true" />
              ) : (
                <i data-tip="Not Started" className="fa fa-play" aria-hidden="true" />
              )}
            </td>
            <td
              className="desktop-view"
              data-tip={`Hours-Best-case: ${parseFloat(props.hoursBest / 8).toFixed(2)} day(s)`}
            >
              {props.hoursBest}
            </td>
            <td
              className="desktop-view"
              data-tip={`Hours-Worst-case: ${parseFloat(props.hoursWorst / 8).toFixed(2)} day(s)`}
            >
              {props.hoursWorst}
            </td>
            <td
              className="desktop-view"
              data-tip={`Hours-Most-case: ${parseFloat(props.hoursMost / 8).toFixed(2)} day(s)`}
            >
              {props.hoursMost}
            </td>
            <td
              className="desktop-view"
              data-tip={`Estimated Hours: ${parseFloat(props.estimatedHours / 8).toFixed(
                2,
              )} day(s)`}
            >
              {parseFloat(props.estimatedHours).toFixed(2)}
            </td>
            <td className="desktop-view">
              {startedDate.getFullYear() !== 1969
                ? `${startedDate.getMonth() +
                    1}/${startedDate.getDate()}/${startedDate.getFullYear()}`
                : null}
              <br />
            </td>
            <td className="desktop-view">
              {dueDate.getFullYear() !== 1969
                ? `${dueDate.getMonth() + 1}/${dueDate.getDate()}/${dueDate.getFullYear()}`
                : null}
            </td>
            <td className="desktop-view">
              {props.links.map((link, i) =>
                link.length > 1 ? (
                  <a key={i} href={link} target="_blank" data-tip={link} rel="noreferrer">
                    <i className="fa fa-link" aria-hidden="true" />
                  </a>
                ) : null,
              )}
            </td>
            <td className="desktop-view" onClick={toggleModel}>
              <i className="fa fa-book" aria-hidden="true" />
            </td>
          </tr>
          {controllerRow ? (
            <tr className="wbsTaskController desktop-view" id={`controller_${props.id}`}>
              <td colSpan={tableColNum} className="controlTd">
                {hasPermission(role, 'addTask', roles, userPermissions) ? (
                  <AddTaskModal
                    key={`addTask_${props.id}`}
                    parentNum={props.num}
                    taskId={props.id}
                    projectId={props.projectId}
                    wbsId={props.wbsId}
                    parentId1={props.parentId1}
                    parentId2={props.parentId2}
                    parentId3={props.parentId3}
                    mother={props.mother}
                    childrenQty={props.childrenQty}
                    level={props.level}
                    openChild={e => openChild(props.num, props.id)}
                    hasPermission={true}
                  />
                ) : null}
                <EditTaskModal
                  key={`editTask_${props.id}`}
                  parentNum={props.num}
                  taskId={props.id}
                  projectId={props.projectId}
                  wbsId={props.wbsId}
                  parentId1={props.parentId1}
                  parentId2={props.parentId2}
                  parentId3={props.parentId3}
                  mother={props.mother}
                  level={props.level}
                />

                {hasPermission(role, 'deleteTask', roles, userPermissions) ? (
                  <>
                    <Button
                      color="danger"
                      size="sm"
                      className="controlBtn"
                      onClick={() => showUpDeleteModal()}
                    >
                      Remove
                    </Button>

                    <Dropdown
                      direction="up"
                      isOpen={dropdownOpen}
                      toggle={toggle}
                      style={{ float: 'left' }}
                    >
                      <DropdownToggle caret color="primary" size="sm">
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
                          } else {
                            passCurrentNum = true;
                          }
                        })}
                      </DropdownMenu>
                    </Dropdown>

                    <Button
                      color="secondary"
                      size="sm"
                      className="margin-left"
                      onClick={() => onCopy(props.id)}
                    >
                      {isCopied ? 'Copied' : 'Copy'}
                    </Button>
                  </>
                ) : null}

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
                      disabled
                      value={props.whyInfo}
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
                      disabled
                      value={props.intentInfo}
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
                      disabled
                      value={props.endstateInfo}
                    />
                  </ModalBody>
                </Modal>

                <ModalDelete
                  isOpen={modalDelete}
                  closeModal={() => {
                    setModalDelete(false);
                  }}
                  confirmModal={() => deleteTask(props.id, props.mother)}
                  modalMessage={props.state.popupEditor.currPopup.popupContent || ''}
                  modalTitle={Message.CONFIRM_DELETION}
                />
              </td>
            </tr>
          ) : null}
        </>
      ) : null}
    </>
  );
};

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps, {
  moveTasks,
  fetchAllTasks,
  deleteTask,
  copyTask,
  getPopupById,
  deleteChildrenTasks,
})(Task);
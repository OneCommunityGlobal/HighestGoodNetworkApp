import React, { useRef, useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  ModalBody,
  Button,
} from 'reactstrap';
import { BsFillCaretDownFill, BsFillCaretUpFill, BsFillCaretLeftFill } from 'react-icons/bs';
import ControllerRow from '../ControllerRow';
import {
  moveTasks,
  deleteTask,
  copyTask,
  deleteChildrenTasks,
} from '../../../../../actions/task.js';
import './tagcolor.css';
import './task.css';
import { Editor } from '@tinymce/tinymce-react';
import { getPopupById } from './../../../../../actions/popupEditorAction';
import { boxStyle } from 'styles';
import { formatDate } from 'utils/formatDate';

function Task(props) {
  /*
  * -------------------------------- variable declarations --------------------------------
  */
  // props from store
  const { tasks } = props;

  const startedDate = new Date(props.startedDatetime);
  const dueDate = new Date(props.dueDatetime);

  // states from hooks
  const [modal, setModal] = useState(false);
  const [controllerRow, setControllerRow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [tableColNum, setTableColNum] = useState(16);
  const [children, setChildren] = useState([]);
  const [showMoreResources, setShowMoreResources] = useState(false);
  const tableRowRef = useRef();

  /*
  * -------------------------------- functions --------------------------------
  */
  const toggleModel = () => setModal(!modal);

  const openChild = () => {
    setIsOpen(!isOpen);
  };

  const getAncestorNames = (motherId) => {
    const motherTask = tasks.find(task => task._id === motherId);
    if (motherTask) {
      const motherTaskName = motherTask.taskName;
      const grandMotherTaskNames = motherTask.mother ? getAncestorNames(motherTask.mother) : '';
      return grandMotherTaskNames ? grandMotherTaskNames + ' <br /> ' + motherTaskName + ' /' : motherTaskName + ' /';
    } else {
      return '';
    }
  };

  const activeController = () => {
    props.setControllerId(props.taskId);
    setControllerRow(!controllerRow);
  }

  const deleteOneTask = (taskId, mother) => {
    props.deleteWBSTask(taskId, mother);
  };

  /*
  * -------------------------------- useEffects --------------------------------
  */
  useEffect(() => {
    if (props.controllerId !== props.taskId) setControllerRow(false);
  }, [props.controllerId])

  useEffect(() => {
    const childTasks = tasks.filter(task => task.mother === props.taskId);
    const filteredChildren = props.filterTasks(childTasks, props.filterState);
    setChildren(filteredChildren);
  }, [props.filterState, tasks])

  useEffect(() => {
    if (tableRowRef.current) {
      const spanColNum = tableRowRef.current.cells.length;
      setTableColNum(spanColNum);
    }
  }, []);

  useEffect(() => {
      setIsOpen(props.openAll);
  }, [props.openAll]);

  return (
    <>
      {props.taskId ? (
        <>
          <tr
            ref={tableRowRef}
            key={props.key}
            className={`num_${props.num?.split('.').join('')} wbsTask  ${
              props.isNew ? 'newTask' : ''
            } parentId1_${props.parentId1} parentId2_${props.parentId2} parentId3_${
              props.parentId3
            } mother_${props.mother} lv_${props.level}`}
            id={props.taskId}
          >
            <td
              className={`tag_color tag_color_${
                props.num?.length > 0 ? props.num.split('.')[0] : props.num
              } tag_color_lv_${props.level}`}
            ></td>
            <td>
              <Button
                color="primary"
                size="sm"
                onClick={activeController}
                style={boxStyle}
              >
                <span className="action-edit-btn">EDIT</span>
                {controllerRow ? <BsFillCaretUpFill /> : <BsFillCaretDownFill />}
              </Button>
            </td>
            <td
              id={`r_${props.num}_${props.taskId}`}
              scope="row"
              className={`taskNum ${props.hasChildren ? 'has_children' : ''}`}
              onClick={openChild}
            >
              {props.num.replaceAll('.0', '')}
            </td>
            <td className="taskName">
              {<div className={`level-space-${props.level}`} data-tip={`${getAncestorNames(props.mother)}`}>
                    <span
                      onClick={openChild}
                      id={`task_name_${props.taskId}`}
                      className={props.hasChildren ? 'has_children' : ''}
                    >
                      {props.hasChildren ? (
                        <i
                          className={`fa fa-folder${isOpen ? '-open' : ''}`}
                          aria-hidden="true"
                        ></i>
                      ) : ''}{' '}
                      {props.name}
                    </span>
              </div>}
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
              {props.resources.length
                ? props.resources
                  .filter((elm, i) => i < 2 || showMoreResources)
                  .map((elm, i) => {
                    return (
                      <a
                        key={`res_${i}`}
                        data-tip={elm.name}
                        className="name"
                        href={`/userprofile/${elm.userID}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {!elm.profilePic || elm.profilePic === "/defaultprofilepic.png"
                          ? <span className="dot">{elm.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                          : <img className="img-circle" src={elm.profilePic} />}
                      </a>
                    );
                  })
                : null}
              {props.resources.length > 2
                ? <a
                    className="resourceMoreToggle"
                    onClick={() => setShowMoreResources(!showMoreResources)}
                  >
                    <span className="dot">{showMoreResources ? <BsFillCaretLeftFill /> : `${props.resources.length - 2}+`}</span>
                  </a>
                : null}
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
                <i data-tip="Active" className="fa fa-clock-o" aria-hidden="true" />
              ) : null}

              {props.status === 'Not Started' ? (
                <i data-tip="Not Started" className="fa fa-play" aria-hidden="true" />
              ) : null}

              {props.status === 'Paused' ? (
                <i data-tip="Paused" className="fa fa-pause" aria-hidden="true" />
              ) : null}

              {props.status === 'Complete' ? (
                <i data-tip="Complete" className="fa fa-check-square-o" aria-hidden="true" />
              ) : null}
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
                ? formatDate(startedDate)
                : null}
              <br />
            </td>
            <td className="desktop-view">
              {dueDate.getFullYear() !== 1969
                ? formatDate(dueDate)
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
              <i className="fa fa-book" aria-hidden="true" data-tip="More info"/>
            </td>
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
          </tr>
          {controllerRow ? (
            <ControllerRow
              tableColNum={tableColNum}
              num={props.num}
              taskId={props.taskId}
              projectId={props.projectId}
              wbsId={props.wbsId}
              parentId1={props.parentId1}
              parentId2={props.parentId2}
              parentId3={props.parentId3}
              mother={props.mother}
              childrenQty={props.childrenQty}
              level={props.level}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              siblings={props.siblings}
              load={props.load}
              pageLoadTime={props.pageLoadTime}
              setIsLoading={props.setIsLoading}
            />
          ) : null}
        </>
      ) : null}
      {isOpen && children.length ? children.map((task, i) => (
        <ConnectedTask
          key={`${task._id}${i}`}
          taskId={task._id}
          level={task.level}
          num={task.num}
          name={task.taskName}
          priority={task.priority}
          resources={task.resources}
          isAssigned={task.isAssigned}
          status={task.status}
          hoursBest={task.hoursBest}
          hoursMost={task.hoursMost}
          hoursWorst={task.hoursWorst}
          estimatedHours={task.estimatedHours}
          startedDatetime={task.startedDatetime}
          dueDatetime={task.dueDatetime}
          links={task.links}
          projectId={props.projectId}
          wbsId={props.wbsId}
          parentId1={task.parentId1}
          parentId2={task.parentId2}
          parentId3={task.parentId3}
          mother={task.mother}
          openAll={props.openAll}
          deleteWBSTask={props.deleteWBSTask}
          hasChildren={task.hasChildren}
          siblings={children}
          whyInfo={task.whyInfo}
          intentInfo={task.intentInfo}
          endstateInfo={task.endstateInfo}
          childrenQty={task.childrenQty}
          filterTasks={props.filterTasks}
          filterState={props.filterState}
          controllerId={props.controllerId}
          setControllerId={props.setControllerId}
          load={props.load}
          pageLoadTime={props.pageLoadTime}
          setIsLoading={props.setIsLoading}
        />)
      ) : null}
    </>
  );
}

const mapStateToProps = state => ({
  tasks: state.tasks.taskItems,
 });

const ConnectedTask = connect(mapStateToProps, {
  moveTasks,
  deleteTask,
  copyTask,
  getPopupById,
  deleteChildrenTasks,
})(Task);

export default ConnectedTask;

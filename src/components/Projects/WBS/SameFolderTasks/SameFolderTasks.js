import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { ENDPOINTS } from 'utils/URL';
import { Table } from 'reactstrap';
import EditTaskModal from '../WBSDetail/EditTask/EditTaskModal';
import { getPopupById } from '../../../../actions/popupEditorAction';
import { TASK_DELETE_POPUP_ID } from '../../../../constants/popupId';

const SameFolderTasks = props => {
  const taskId = props.match.params.taskId;

  const [task, setTask] = useState({});
  const [wbsId, setWBSId] = useState('');

  const [allTasks, setAllTasks] = useState([]);
  const [WBS, setWBS] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(taskId));
        setTask(res?.data || {});
        setWBSId(res?.data.wbsId || '');
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskData();
  }, []);

  useEffect(() => {
    const fetchWBSData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_WBS(wbsId));
        setWBS(res?.data || {});
      } catch (error) {
        console.log(error);
      }
    };

    fetchAllTasks();
    fetchWBSData();
  }, [wbsId]);

  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(ENDPOINTS.TASKS(task.wbsId, task.level, task.mother));
      setAllTasks(res?.data || []);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  let projectId = WBS.projectId;
  let wbsName = WBS.wbsName;

  if (task.mother === null || task.mother === taskId) {
    return (
      <div className="App">
        <p>There are no other tasks in this task's folder.</p>
        <a href={`/wbs/tasks/${wbsId}/${projectId}/${wbsName}`}>
          Click here to visit the source WBS ({wbsName}) that contains this task
        </a>
      </div>
    );
  } else {
    return (
      <div className="container">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center pt-4">
            <div className="spinner-border text-success " role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <Table responsive>
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
                {allTasks.map((e, i) => {
                  return (
                    <tr key={i}>
                      <th>
                        <EditTaskModal
                          key={`editTask_${e._id}`}
                          parentNum={e.num}
                          taskId={e._id}
                          wbsId={e.wbsId}
                          parentId1={e.parentId1}
                          parentId2={e.parentId2}
                          parentId3={e.parentId3}
                          mother={e.mother}
                          level={e.level}
                        />
                      </th>
                      <th>{e.num}</th>
                      <td>{e.taskName}</td>
                      <td>{e.priority}</td>
                      <td className="desktop-view">
                        {e.resources &&
                          e.resources.map((element, key) => {
                            try {
                              if (element.profilePic) {
                                return (
                                  <a
                                    key={`res_${key}`}
                                    data-tip={element.name}
                                    className="name"
                                    href={`/userprofile/${element.userID}`}
                                    target="_blank"
                                  >
                                    <img className="img-circle" src={element.profilePic} />
                                  </a>
                                );
                              } else {
                                return (
                                  <a
                                    key={`res_${key}`}
                                    data-tip={element.name}
                                    className="name"
                                    href={`/userprofile/${element.userID}`}
                                    target="_blank"
                                  >
                                    <span className="dot">{element.name.substring(0, 2)}</span>
                                  </a>
                                );
                              }
                            } catch (error) {}
                          })}
                      </td>
                      <td>
                        {e.isAssigned ? (
                          <i
                            data-tip="Assigned"
                            className="fa fa-check-square"
                            aria-hidden="true"
                          ></i>
                        ) : (
                          <i
                            data-tip="Not Assigned"
                            className="fa fa-square-o"
                            aria-hidden="true"
                          ></i>
                        )}
                      </td>
                      <td>{e.status}</td>
                      <td>{e.hoursBest}</td>
                      <td>{e.hoursWorst}</td>
                      <td>{e.hoursMost}</td>
                      <td>{parseFloat(e.estimatedHours).toFixed(2)}</td>
                      <td>{parseFloat(e.hoursLogged).toFixed(2)}</td>
                      <td>{e.startedDatetime ? e.startedDatetime.slice(0, 10) : 'N/A'}</td>
                      <td>{e.dueDatetime ? e.dueDatetime.slice(0, 10) : 'N/A'}</td>
                      <td>{e.links}</td>
                      <td className="desktop-view">
                        <i className="fa fa-book" aria-hidden="true"></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </React.Fragment>
        )}
      </div>
    );
  }
};

const mapStateToProps = state => state;

export default connect(mapStateToProps, {
  getPopupById,
})(SameFolderTasks);

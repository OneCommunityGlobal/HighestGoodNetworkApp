import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { connect } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import { useHistory } from 'react-router-dom';

import { getPopupById } from '../../../../actions/popupEditorAction';

function SameFolderTasks(props) {
  const { taskId } = props.match.params;
  const history = useHistory();

  let isMounted = true;

  const [task, setTask] = useState({});
  const [wbsId, setWBSId] = useState('');

  const [projectId, setProjectId] = useState('');
  const [wbsName, setWbsName] = useState('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(taskId));
        if (isMounted) {
          setTask(res?.data || {});
          setWBSId(res?.data?.wbsId || '');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    fetchTaskData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchWBSData = async () => {
      try {
        if (!wbsId) return;
        const res = await axios.get(ENDPOINTS.GET_WBS(wbsId));
        if (isMounted) {
          setProjectId(res?.data?.projectId || '');
          setWbsName(res?.data?.wbsName || '');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    };

    if (wbsId) {
      // setLoading(true);
      fetchAllTasks();
      fetchWBSData();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wbsId]);

  // Always return the user to the full Work Breakdown Structure view, regardless of
  // whether the task is nested inside a folder (has a `mother`) or top-level.
  // Previously this only redirected when the task had no other tasks in its folder,
  // which meant nested/folder-created tasks got stuck on this same-folder view with
  // no way to add a new task. See hotfix: WBS nested task navigation bug.
  useEffect(() => {
    if (!wbsId || !projectId || !wbsName) return;

    history.replace(`/wbs/tasks/${wbsId}/${projectId}/${encodeURIComponent(wbsName)}`);
  }, [wbsId, projectId, wbsName, history]);

  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(ENDPOINTS.TASKS(task.wbsId, task.level, task.mother));
      if (isMounted) {
        if (JSON.stringify(res?.data) === '{}') setAllTasks([]);
        else {
          console.log("DEBUG: ", res.data);
          setAllTasks(res?.data || []);
        }
      }
      // setLoading(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Fetch tasks err:", error);
      // setLoading(false);
    }
  };

  // This component now always redirects to the full WBS view above, so the
  // same-folder table below is effectively dead code kept for a possible future
  // reversion. Render the loading spinner unconditionally while the redirect runs.
  return (
    <div className="d-flex justify-content-center align-items-center pt-4">
      <output
        className="spinner-border text-success"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading...</span>
      </output>
    </div>
  );
}

const mapStateToProps = state => state;

export default connect(mapStateToProps, {
  getPopupById,
})(SameFolderTasks);
// WARNING: HIGHLY INEFFICIENT CODE

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'

import { ENDPOINTS } from '~/utils/URL';

const filterAndSort = (tasks, level) => {
  return tasks.sort((a, b) => {
    const aArr = a.num.split('.');
    const bArr = b.num.split('.');
    for (let i = 0; i < level; i += 1) {
      if (+aArr[i] !== +bArr[i]) return +aArr[i] - +bArr[i];
    }
    return 0;
  });
};

const sortByNum = tasks => {
  const appendTasks = tasks.map(task => {
    /** Based on my observation, previous addTask functionality is not working properly,
     * the created new task does not change its parent task property 'hasChild' from default false to true,
     * so below are the temporary fix to create a 'hasChildren' property to represent the actual 'hasChild' value
     * this should be fixed by future PR. --- PR#934
     */
    const hasChildren = tasks.some(item => item?.mother === task._id);

    /** task.num from response data has different form for different level:
     *    level 1: x
     *    level 2: x.x
     *    level 3: x.x.x
     *  below is trying to make sure the num property in state is in the same form of x.x.x.x,
     * */
    const numOfNums = task.num.split('.').length;
    const num = task.num.concat('.0'.repeat(4 - numOfNums));

    return { ...task, num, hasChildren };
  });

  return filterAndSort(appendTasks, 4);
};

/**
 * Custom hook to fetch tasks for a given WBS, level, and parent task
 * @param {string} wbsId - ID of the WBS
 * @param {string} projectId - ID of the project (to watch for category changes)
 * @param {number} level - Depth level (e.g. 0,1,2,...)
 * @param {string|null} parent - Parent task ID or null
 * @returns {{ tasks: Task[] | null, isLoading: boolean, error: string | null, refetch: function }}
 */
export const useFetchWbsTasks = (wbsId, projectId = null, level = 0, parent = null) => {
  const [tasks, setTasks] = useState(/** @type {Task[] | null} */([]))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(/** @type {string | null} */(null))
  
  // Watch the project's category from Redux - refetch when it changes
  const projectCategory = useSelector(state => {
    if (!projectId) return null;
    const project = state.allProjects?.projects?.find(p => p._id === projectId);
    return project?.category;
  });

  const fetchTasks = useCallback(async () => {
    setTasks([])
    setIsLoading(true)
    setError(null)
    try {
      const response = await Promise.all([1, 2, 3, 4, 5].map(async num => {
        const res = await axios.get(ENDPOINTS.TASKS(wbsId, num, parent));
        return await res.data;
      }));
      const sorted = sortByNum(response.flat());
      setTasks(sorted)
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }, [wbsId, level, parent])

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])
  
  // Refetch when project category changes
  useEffect(() => {
    if (projectCategory) {
      fetchTasks();
    }
  }, [projectCategory]);

  return {
    tasks,
    isLoading,
    error,
    /**
     * Manually refetch tasks
     */
    refresh: fetchTasks,
  }
}

/**
 * Custom hook to fetch all task levels for a given WBS
 * @param {string} wbsId - ID of the WBS
 * @param {number[]} levelList - Array of levels to fetch (e.g. [0,1,2])
 * @param {string|null} parent - Parent task ID or null
 * @returns {{ tasksByLevel: Record<number, Task[]>, isLoading: boolean, error: string|null, refetchAll: function, lastFetched: number|null }}
 */
export const useFetchAllTasks = (wbsId, levelList = [0, 1, 2, 3, 4], parent = null) => {
  const [tasksByLevel, setTasksByLevel] = useState(/** @type {Record<number, Task[]>} */({}))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(/** @type {string|null} */(null))
  const [lastFetched, setLastFetched] = useState(/** @type {number|null} */(null))

  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await Promise.all(
        levelList.map(async (lvl) => {
          const nextLevel = lvl === -1 ? 1 : lvl + 1
          const params = { level: nextLevel }
          if (parent) params.parent = parent
          const response = await axios.get(ENDPOINTS.TASKS(wbsId, lvl, parent))
          return { level: lvl, data: response.data }
        })
      )
      const grouped = results.reduce((acc, { level, data }) => {
        acc[level] = data
        return acc
      }, {})
      setTasksByLevel(grouped)
      setLastFetched(Date.now())
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }, [wbsId, levelList, parent])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    tasksByLevel,
    isLoading,
    error,
    lastFetched,
    refetchAll: fetchAll,
  }
}
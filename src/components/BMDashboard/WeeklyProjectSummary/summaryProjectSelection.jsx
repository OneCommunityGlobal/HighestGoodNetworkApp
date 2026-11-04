import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const SummaryProjects = createContext(null);
const EMPTY_PROJECTS = [];

// Do not infer recency from response order, names, or ObjectIds. Legacy BM
// projects have dateCreated; newer records also have Mongoose timestamps.
export function getLatestProject(projects = []) {
  const timestamp = project =>
    Math.max(
      ...['updatedAt', 'createdAt', 'dateCreated', 'modifiedDatetime', 'createdDatetime'].map(
        key => {
          const value = project[key];
          const parsed = value ? new Date(value).getTime() : NaN;
          return Number.isFinite(parsed) ? parsed : -Infinity;
        },
      ),
    );
  return projects.reduce((latest, project) => {
    if (!project?._id || !Number.isFinite(timestamp(project))) return latest;
    if (!latest || timestamp(project) > timestamp(latest)) return project;
    if (timestamp(project) === timestamp(latest) && String(project._id) < String(latest._id)) {
      return project;
    }
    return latest;
  }, null);
}

export function SummaryProjectProvider({ projects, children }) {
  const snapshot = useRef(null);
  const selections = useRef(new Map());
  // Freeze the default for this page visit. Refreshes must not move existing
  // charts, or charts opened later, to a different project.
  if (!snapshot.current) snapshot.current = getLatestProject(projects);
  const normalized = useMemo(
    () =>
      projects.map(project => ({
        ...project,
        id: project._id,
        projectId: project._id,
        projectName: project.name,
        value: project._id,
        label: project.name,
      })),
    [projects],
  );
  const value = useMemo(
    () => ({
      projects: normalized,
      defaultProject: snapshot.current,
      selections: selections.current,
    }),
    [normalized],
  );
  return <SummaryProjects.Provider value={value}>{children}</SummaryProjects.Provider>;
}

SummaryProjectProvider.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.node.isRequired,
};

export function useSummaryScope() {
  return useContext(SummaryProjects);
}

export function useSummaryProjects(fallback = EMPTY_PROJECTS) {
  const scope = useSummaryScope();
  return useMemo(() => {
    if (!scope) return fallback;
    const identity = project =>
      String(project._id || project.projectId || project.id || project.value);
    const ids = new Set(scope.projects.map(identity));
    return [...scope.projects, ...fallback.filter(project => !ids.has(identity(project)))];
  }, [scope, fallback]);
}

function projectValue(project, shape) {
  const option = { value: project._id, label: project.name };
  switch (shape) {
    case 'ids':
      return [project._id];
    case 'name':
      return project.name;
    case 'names':
      return [project.name];
    case 'option':
      return option;
    case 'options':
      return [option];
    case 'source':
      return { ...option, type: 'project' };
    default:
      return project._id;
  }
}

// Only defaults are shared. Each key retains its own user choice, including
// an empty/all choice, across collapses and layout remounts within this page.
export function useSummaryProjectSelection(key, initialValue, shape = 'id') {
  const scope = useSummaryScope();
  const [localValue, setLocalValue] = useState(initialValue);
  const [, render] = useState(0);
  if (scope?.defaultProject && !scope.selections.has(key)) {
    scope.selections.set(key, projectValue(scope.defaultProject, shape));
  }
  const value = scope
    ? scope.selections.has(key)
      ? scope.selections.get(key)
      : scope.defaultProject
      ? projectValue(scope.defaultProject, shape)
      : localValue
    : localValue;
  const setValue = useCallback(
    next => {
      if (!scope) {
        setLocalValue(next);
        return;
      }
      const previous = scope.selections.has(key)
        ? scope.selections.get(key)
        : scope.defaultProject
        ? projectValue(scope.defaultProject, shape)
        : localValue;
      scope.selections.set(key, typeof next === 'function' ? next(previous) : next);
      render(count => count + 1);
    },
    [scope, key, shape, localValue],
  );
  // Stable identity prevents effects from refetching on unrelated rerenders.
  return [value, setValue];
}

import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LogBar from './LogBar';
import RentedToolsDisplay from './RentedTools/RentedToolsDisplay';
import MaterialsDisplay from './Materials/MaterialsDisplay';
import ProjectLog from './ProjectLog';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import { fetchProjectById } from '../../../../actions/bmdashboard/projectByIdAction';
import './ProjectDetails.css';

function ProjectDetails() {
  const { projectId } = useParams();
  const dispatch = useDispatch();

  const darkMode = useSelector(state => state.theme?.darkMode);
  const projects = useSelector(state => state.bmProjects) || [];

  // Local loading + single fallback
  const [requestedList, setRequestedList] = useState(false);
  const [requestedSingle, setRequestedSingle] = useState(false);
  const [singleProject, setSingleProject] = useState(null);

  // Fetch full list if empty
  useEffect(() => {
    if (projects.length === 0 && !requestedList) {
      setRequestedList(true);
      dispatch(fetchBMProjects());
    }
  }, [projects.length, requestedList, dispatch]);

  // If list fetched (or was empty) and project still not found, fetch single
  useEffect(() => {
    const found = projects.find(p => String(p._id) === String(projectId));
    if (!found && projects.length > 0 && !requestedSingle) {
      setRequestedSingle(true);
      dispatch(fetchProjectById(projectId)).then(p => {
        if (p) setSingleProject(p);
      });
    }
    // Also allow single fetch when list remains empty after first attempt
    if (projects.length === 0 && requestedList && !requestedSingle) {
      setRequestedSingle(true);
      dispatch(fetchProjectById(projectId)).then(p => {
        if (p) setSingleProject(p);
      });
    }
  }, [projects, projectId, requestedList, requestedSingle, dispatch]);

  const currProject =
    projects.find(p => String(p._id) === String(projectId)) ||
    (singleProject && String(singleProject._id) === String(projectId) ? singleProject : null);

  const loading =
    (!requestedList && projects.length === 0) ||
    (requestedList && projects.length === 0 && !requestedSingle) ||
    (requestedSingle && !currProject);

  if (loading && !currProject) {
    return (
      <Container className="project-details text-center mt-5">
        <h2>Loading project…</h2>
      </Container>
    );
  }

  if (!loading && !currProject) {
    return (
      <Container className="project-details text-center mt-5">
        <h2 className="text-danger">Project Not Found</h2>
        <p>Please verify the project ID or select another project.</p>
      </Container>
    );
  }

  return (
    <Container fluid className={`${darkMode ? 'project-details-dark' : 'project-details'}`}>
      <h2 className="text-center mt-4 mb-4">
        {currProject.projectName || currProject.name} Dashboard
      </h2>
      <LogBar projectId={currProject._id} />
      <div className="d-flex flex-column flex-lg-row justify-content-evenly my-4 gap-5">
        <RentedToolsDisplay projectId={currProject._id} />
        <MaterialsDisplay projectId={currProject._id} />
      </div>
      <ProjectLog projectId={currProject._id} />
    </Container>
  );
}

export default ProjectDetails;

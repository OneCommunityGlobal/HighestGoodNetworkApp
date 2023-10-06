import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { projectId } = useParams();

  return (
    <div style={{ textAlign: 'center', marginTop: '5em' }}>
      Welcome to Project #{projectId} Details Page
    </div>
  );
};

export default ProjectDetails;

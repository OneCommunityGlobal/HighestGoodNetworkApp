import { useState } from 'react';
// import ReusablesTable from './ReusablesTable';
import ReusablesInputs from './ReusablesInputs';
import './ReusablesViewStyle.css';

function ReusablesView() {
  const [reusable, setReusable] = useState({ label: 'All Reusables', value: '0' });
  const [project, setProject] = useState({ label: 'All Projects', value: '0' });

  return (
    <div className="PageViewContainer">
      <div className="Page">
        <div className="Box">
          <div className="BuildingTitle">REUSABLES</div>
          <ReusablesInputs
            reusable={reusable}
            setReusable={setReusable}
            project={project}
            setProject={setProject}
          />
          {/* <ReusablesTable
            reusable={reusable}
            setReusable={setReusable}
            project={project}
            setProject={setProject}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default ReusablesView;

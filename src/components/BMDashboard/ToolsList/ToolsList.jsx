import { useState, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';

import { fetchAllTools } from 'actions/bmdashboard/toolsActions';
import BMError from '../shared/BMError';
import SelectForm from './SelectForm';
import SelectTool from './SelectTool';
import ToolsTable from './ToolsTable';
import './ToolsList.css';

export function ToolsList(props) {
  // props & state
  const { tools, errors, dispatch } = props;
  const [filteredTools, setFilteredTools] = useState(tools);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTool, setSelectedTool] = useState('all');
  const [isError, setIsError] = useState(false);
  const postToolUpdateResult = useSelector(state => state.tools.updateTools);

  // dispatch tools fetch action : on load and update
  // response is mapped to tools or errors in redux store
  useEffect(() => {
    if (postToolUpdateResult.result == null) dispatch(fetchAllTools());
  }, [postToolUpdateResult.result]); // To refresh with new tools after update

  useEffect(() => {
    if (tools) {
      setFilteredTools([...tools]);
    }
  }, [tools]);

  // filter tools data by project
  useEffect(() => {
    let filterTools;
    if (selectedProject === 'all' && selectedTool === 'all') {
      setFilteredTools([...tools]);
    } else if (selectedProject !== 'all' && selectedTool === 'all') {
      filterTools = tools.filter(mat => mat.project?.name === selectedProject);
      setFilteredTools([...filterTools]);
    } else if (selectedProject === 'all' && selectedTool !== 'all') {
      filterTools = tools.filter(mat => mat.itemType?.name === selectedTool);
      setFilteredTools([...filterTools]);
    } else {
      filterTools = tools.filter(
        mat => mat.project?.name === selectedProject && mat.itemType?.name === selectedTool,
      );
      setFilteredTools([...filterTools]);
    }
  }, [selectedProject, selectedTool]);

  // trigger error state if an error object is added to props
  useEffect(() => {
    if (errors && Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  // error state
  if (isError) {
    return (
      <main className="tools_list_container">
        <h2>Tools List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  return (
    <main className="tools_list_container">
      <h3>Tools</h3>
      <section>
        <span style={{ display: 'flex', margin: '5px' }}>
          <SelectForm
            tools={tools}
            setSelectedProject={setSelectedProject}
            setSelectedTool={setSelectedTool}
          />
          <SelectTool
            tools={tools}
            selectedProject={selectedProject}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          />
        </span>
        <ToolsTable filteredTools={filteredTools} />
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  tools: state.tools.toolsList,
  errors: state.errors,
});

export default connect(mapStateToProps)(ToolsList);

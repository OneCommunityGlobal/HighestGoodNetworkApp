import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Form, FormGroup, Label, Input } from 'reactstrap';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';

export function MaterialsList(props) {
  console.log('materials props: ', props);
  // props & state
  const { materials, errors } = props;
  // console.log('🚀 ~ file: MaterialsList.jsx:47 ~ MaterialsList ~ materials:', materials);
  const [filteredMaterials, setFilteredMaterials] = useState(materials);
  const [selectedProject, setSelectedProject] = useState('all');
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState({ status: '', message: '' });

  // dispatch materials fetch action
  useEffect(() => {
    props.dispatch(fetchAllMaterials());
  }, []);

  // create selectable projects
  let projectsSet = [];
  if (filteredMaterials.length) {
    projectsSet = [...new Set(materials.map(mat => mat.project.projectName))];
  }

  // filter materials data by project
  useEffect(() => {
    if (selectedProject === 'all') {
      return setFilteredMaterials(materials);
    }
    const filterMaterials = materials.filter(mat => mat.project.projectName === selectedProject);
    setFilteredMaterials(filterMaterials);
  }, [selectedProject]);

  // error handling
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
      // no response object if server is offline
      if (!errors.response) {
        return setError({
          status: 503,
          message: 'The server is temporarily offline. Please try again later.',
        });
      }
      setError({
        status: errors.response.status,
        message: errors.response.statusText,
      });
    }
  }, [errors]);

  if (isError) {
    return (
      <main>
        <h2>Materials List</h2>
        <section>
          <p>There was an error!</p>
          <p>Error Code: {error.status}</p>
          <p>Error Message: {error.message}</p>
          <p>Try again:</p>
          <button onClick={() => location.reload()}>Reload</button>
        </section>
      </main>
    );
  }

  return (
    <main>
      <h2>Materials List</h2>
      <section>
        <div>
          <Form>
            <FormGroup>
              <Label htmlFor="select-project">Project:</Label>
              <Input
                id="select-project"
                name="select-project"
                type="select"
                onChange={e => setSelectedProject(e.target.value)}
                disabled={!materials.length}
              >
                {materials.length ? (
                  <>
                    <option value="all">All</option>
                    {projectsSet.map((name, i) => {
                      return (
                        <option key={i} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </>
                ) : (
                  <option>No data</option>
                )}
              </Input>
            </FormGroup>
          </Form>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Hold</th>
              <th>Wasted</th>
              <th>Log</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.length ? (
              filteredMaterials.map((mat, i) => {
                return (
                  <tr key={i}>
                    <td>{mat.project.projectName}</td>
                    <td>{mat.inventoryItemType.name}</td>
                    <td>{mat.inventoryItemType.uom}</td>
                    <td>{mat.stockBought}</td>
                    <td>{mat.stockUsed}</td>
                    <td>{mat.stockAvailable}</td>
                    <td>{mat.stockHeld}</td>
                    <td>{mat.stockWasted}</td>
                    <td>Button</td>
                    <td>Button</td>
                    <td>Button</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center' }}>
                  No materials data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  // auth: state.auth,
  materials: state.materials,
  errors: state.errors,
});

export default connect(mapStateToProps)(MaterialsList);

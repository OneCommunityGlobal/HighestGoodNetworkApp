import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Form, FormGroup, Label, Input } from 'reactstrap';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';

export function MaterialsList(props) {
  // console.log('materials props: ', props);
  // props & state
  const { materials } = props;
  console.log('🚀 ~ file: MaterialsList.jsx:47 ~ MaterialsList ~ materials:', materials);
  const [filteredMaterials, setFilteredMaterials] = useState(materials || []);
  const [selectedProject, setSelectedProject] = useState('all');

  // dispatch materials fetch action
  useEffect(() => {
    props.dispatch(fetchAllMaterials());
  }, []);

  // create selectable projects
  const projectsSet = [...new Set(materials.map(mat => mat.project.projectName))];

  // filter materials data by project
  useEffect(() => {
    if (selectedProject === 'all') {
      return setFilteredMaterials(materials);
    }
    const filterMaterials = materials.filter(mat => mat.project.projectName === selectedProject);
    setFilteredMaterials(filterMaterials);
  }, [selectedProject]);

  return (
    <main>
      <h2>Material List</h2>
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
              >
                <option value="all">All</option>
                {projectsSet.map((name, i) => {
                  return (
                    <option key={i} value={name}>
                      {name}
                    </option>
                  );
                })}
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
            {filteredMaterials.map((mat, i) => {
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
            })}
          </tbody>
        </Table>
      </section>
    </main>
  );
}

const mapStateToProps = state => ({
  // auth: state.auth,
  materials: state.materials,
});

export default connect(mapStateToProps)(MaterialsList);

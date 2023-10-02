import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Form, FormGroup, Label, Input } from 'reactstrap';

import { fetchAllMaterials } from 'actions/bmdashboard/materialsActions';

const dummyData = [
  {
    id: 'M1',
    projectId: 'P1',
    name: 'Sand',
    unit: 'kg',
    bought: 55,
    used: 25,
    available: 25,
    hold: 5,
    wasted: 0,
  },
  {
    id: 'M2',
    projectId: 'P1',
    name: 'Rock',
    unit: 'kg',
    bought: 100,
    used: 50,
    available: 50,
    hold: 0,
    wasted: 0,
  },
  {
    id: 'M3',
    projectId: 'P2',
    name: 'Brick',
    unit: 'count',
    bought: 1000,
    used: 500,
    available: 400,
    hold: 100,
    wasted: 0,
  },
];

export function MaterialsList(props) {
  console.log('materials props: ', props);

  // dispatch materials fetch action
  useEffect(() => props.dispatch(fetchAllMaterials()), []);

  // filter materials data by project
  const [selectProject, setSelectProject] = useState('all');
  useEffect(() => {
    if (selectProject === 'all') {
      return setMaterials(dummyData);
    }
    const filterMaterials = dummyData.filter(mat => mat.projectId === selectProject);
    setMaterials(filterMaterials);
  }, [selectProject]);

  // create selectable projects set
  const projects = [...new Set(dummyData.map(mat => mat.projectId))];
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
                onChange={e => setSelectProject(e.target.value)}
              >
                <option value="all">All</option>
                {projects.map((name, i) => {
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
              <th>PID</th>
              <th>ID</th>
              <th>Name</th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Hold</th>
              <th>Wasted</th>
              <th>Usage Record</th>
              <th>Update Record</th>
              <th>Purchase Record</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat, i) => {
              return (
                <tr key={i}>
                  <td>{mat.projectId}</td>
                  <td>{mat.id}</td>
                  <td>{mat.name}</td>
                  <td>{mat.unit}</td>
                  <td>{mat.bought}</td>
                  <td>{mat.used}</td>
                  <td>{mat.available}</td>
                  <td>{mat.hold}</td>
                  <td>{mat.wasted}</td>
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

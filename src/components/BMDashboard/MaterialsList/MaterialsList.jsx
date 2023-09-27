// import { connect } from 'react-redux';
import { Table } from 'reactstrap';

const dummyData = [
  {
    id: 'P1',
    projectId: 'M1',
    name: 'Sand',
    unit: 'kg',
    bought: 55,
    used: 25,
    available: 25,
    hold: 5,
    wasted: 0,
  },
  {
    id: 'P1',
    projectId: 'M2',
    name: 'Rock',
    unit: 'kg',
    bought: 100,
    used: 50,
    available: 50,
    hold: 0,
    wasted: 0,
  },
  {
    id: 'P2',
    projectId: 'M3',
    name: 'Brick',
    unit: 'count',
    bought: 1000,
    used: 500,
    available: 400,
    hold: 100,
    wasted: 0,
  },
];

export default function MaterialsList() {
  return (
    <main>
      <h2>Material List</h2>
      <section>
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
            {dummyData.map((mat, idx) => {
              return (
                <tr key={idx}>
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

// const mapStateToProps = state => ({
//   auth: state.auth,
// });

// export default connect(mapStateToProps)(MaterialsList);

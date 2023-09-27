// import { connect } from 'react-redux';
import { Table } from 'reactstrap';

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
        </Table>
      </section>
    </main>
  );
}

// const mapStateToProps = state => ({
//   auth: state.auth,
// });

// export default connect(mapStateToProps)(MaterialsList);

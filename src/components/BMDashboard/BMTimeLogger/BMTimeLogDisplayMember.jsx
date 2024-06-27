import { Card } from 'reactstrap';

// function BMTimeLogCard({ selectedProject }) {
function BMTimeLogDisplayMember({ firstName, lastName, index }) {
  console.log('firstName: ', firstName);
  console.log('lastName: ', lastName);
  console.log('index: ', index);

  return (
    <Card className="project-details" fluid>
      {firstName} {lastName}
    </Card>
  );
}

export default BMTimeLogDisplayMember;

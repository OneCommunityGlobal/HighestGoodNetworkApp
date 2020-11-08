import React from 'react';
import {
  Table, Button
} from 'reactstrap';

const BadgeReport = () => (
  <div>
    <Table>
      <thead>
        <tr>
          <th>Badge</th>
          <th>Name</th>
          <th>Description</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>50px image</td>
          <td>3000 Hours Education</td>
          <td>This badge belongs to the Education category, and the HGN Software Development project. People who earn this badge have completed 3000 hours of computer science courses. This badge has a ranking of 21.</td>
          <td>checkbox</td>
        </tr>
        <tr>
          <td>50px image</td>
          <td>3000 Hours Education</td>
          <td>This badge belongs to the Education category, and the HGN Software Development project. People who earn this badge have completed 3000 hours of computer science courses. This badge has a ranking of 21.</td>
          <td>checkbox</td>
        </tr>
        <tr>
          <td>50px image</td>
          <td>3000 Hours Education</td>
          <td>This badge belongs to the Education category, and the HGN Software Development project. People who earn this badge have completed 3000 hours of computer science courses. This badge has a ranking of 21.</td>
          <td>checkbox</td>
        </tr>
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Export to PDF</Button>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} >Feature on Profile</Button>

  </div >
);

export default BadgeReport;
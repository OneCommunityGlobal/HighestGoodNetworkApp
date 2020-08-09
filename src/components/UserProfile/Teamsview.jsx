import React from 'react'
import { Card, CardTitle, CardText, CardBody, Button } from 'reactstrap'
import { EditorPropTypes } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/EditorPropTypes'


const Teamdataheader = () => {
  return (<tr>
    <th>Name</th>
  </tr>)
}
const Teamtabledata = (props) => {
  return (
    <tr>
      <td>{props.teammembers.teamName}</td>
    </tr>
  )
}

const Teams = React.memo((props) => {
  return (
    <Card body>
      <CardTitle
        style={{
          fontWeight: 'bold',
          fontSize: 20,
          textDecoration: 'underLine'
        }}>
        Teams
			</CardTitle>
      <CardBody>
        <CardText>
          <table border='1'>
            <Teamdataheader />
            {props.teamsdata.map(
              team => {
                return <Teamtabledata teammembers={team} />
              }
            )}
          </table>
        </CardText>
        <Button color='primary' disabled>
          Add a Team
				</Button>
      </CardBody>
    </Card>
  )
}
)

export default Teams;

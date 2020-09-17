import React, { useState } from 'react'
import { Card, CardTitle, CardText, CardBody, Button,
  Dropdown, DropdownMenu, DropdownItem, DropdownToggle} from 'reactstrap'
import { EditorPropTypes } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/EditorPropTypes'


const Teamdataheader = () => {
  return (<tr>
    <th>Name</th>
  </tr>)
}
const Teamtabledata = (props) => {
  return (
    <tr>
      <td>
        {props.teammembers.teamName} 
        { props.edit && <button>delete</button>}
      </td>
    </tr>
  )
}

const Teams = React.memo((props) => {
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);


  return (
    <Card>
      <CardTitle>
        Teams
			</CardTitle>
      
      <CardBody>
        <CardText>
          <table border='1'>
            {props.teamsdata.map(
              team => {
                return <Teamtabledata teammembers={team} edit={props.edit}/>
              }
            )}
          </table>
        </CardText>
        
        {props.edit && 
          <Button color='primary'>
            Add a Team
          </Button>
        }
      </CardBody>
      {props.edit && 
        <CardBody>
          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle caret>
              TEAMS
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Header</DropdownItem>
              {props.allTeams.map( team => 
                <DropdownItem>{team.teamName}</DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </CardBody>
      }

    </Card>
  )
}
)

export default Teams;

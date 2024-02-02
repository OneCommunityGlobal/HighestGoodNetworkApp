import { useEffect, useState } from 'react';
import React, {
  Container,
  Form,
  Row,
  Col,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Input,
  Label,
  Button,
  InputGroup,
  ButtonDropdown,
  InputGroupAddon
} from 'reactstrap';
import './Log.css';
import { CloseButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import string from 'joi/lib/types/string';

function Log() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCheckInOutDropdownOpen, setIsCheckInOutDropdownOpen] = useState(false);
  const logFormHeading = 'Tool Equipment Daily Activities Log';
  const today = new Date().toISOString().split('T')[0];
  const [projectDropdownCaretText, setProjectDropdownCaretText] = useState('Project');
  const history = useHistory();
  const [toolEquipmentIdToSet, setToolEquipmentIdToSet] = useState([]);
  const dummyDataMap = new Map([
    ["Project 1", {
      projectData: [
        {
          id: 1,
          name: "Item 1",
          workingItems: [
            { id: "1" },
            { id: "2" },
            { id: "3" },
            { id: "4" },
            { id: "5" },
          ],
          working: 5,
          available: 2,
          using: 3,
        },
        {
          id: 2,
          name: "Item 2",
          working: 8,
          available: 4,
          using: 4,
        },
      ],
    }],
    // Add more projects as needed
  ]);
  

  const onProjectDropdownItemClick = projectName => {
    console.log('projectName: ' + projectName);
    console.log(JSON.stringify(dummyDataMap.get(projectName)));
    setProjectDropdownCaretText(projectName);
  };

  const handleButtonClick = (id, key) => {
    console.log('id: ' + typeof(id));
    console.log('key: ' + typeof(key));
    addIdToSetIfNotExists(id, key);
  };

  function addIdToSetIfNotExists(key, id) {
    setToolEquipmentIdToSet(prevState => {
      const updatedState = { ...prevState };

      if (!updatedState[key]) {
        updatedState[key] = new Set([id]);
        console.log("added id");
        console.log("updatedState[key]: " + updatedState[key].has(id));
      } else {
        const currentSet = updatedState[key];

        if (currentSet.has(id)) {
          currentSet.delete(id);
          console.log('delete');
        } else {
          console.log('add');
          currentSet.add(id);
        }
      }

      return updatedState;
    });
  }

  const handleCancel = () => history.goBack();


  useEffect(()  => {
    console.log("z[key]: " + toolEquipmentIdToSet["1"]?.has("1"));
  },[toolEquipmentIdToSet]);

  // Check in shows Using
  // Check out shows Available

  const toggleProjectDowndown = () => {
    setIsProjectDropdownOpen(prevState => setIsProjectDropdownOpen(!prevState));
  };

  const toggleCheckInOutDropdown = () => {
    setIsCheckInOutDropdownOpen(prevState => setIsCheckInOutDropdownOpen(!prevState));
  };

  return (
    <div className="page">
      <div className="log-form-container">
        <Form>
          <Row>
            <Label className="title-label">{logFormHeading}</Label>
          </Row>
          <Row className="dropdown-row">
            <Col>
              <Label>Date:</Label>
            </Col>
            <Col>
              <Input type="date" defaultValue={today} disabled />
            </Col>
            <Col>Project:</Col>
            <Col>
              <Dropdown isOpen={isProjectDropdownOpen} toggle={toggleProjectDowndown}>
                <DropdownToggle caret>{projectDropdownCaretText}</DropdownToggle>
                <DropdownMenu>
                {[...dummyDataMap.keys()].map(projectName => (
                    <DropdownItem
                      key={projectName}
                      onClick={() => onProjectDropdownItemClick(projectName)}
                    >
                      {projectName}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </Col>
            <Col>Check in or Out: </Col>
            <Col>
              <Dropdown isOpen={isCheckInOutDropdownOpen} toggle={toggleCheckInOutDropdown}>
                <DropdownToggle caret>Check out</DropdownToggle>
                <DropdownMenu>
                  <DropdownItem>Check In</DropdownItem>
                  <DropdownItem>Check Out</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Col>
          </Row>
          <Row className="subtitle-row">
            <Col>
              <Label>Item</Label>
            </Col>
            <Col>
              <Label>Quantity</Label>
            </Col>
            <Col>
              <Label>Daily Log Input</Label>
            </Col>
          </Row>
          <Row>
            <Col>
              <Label>ID</Label>
            </Col>
            <Col>
              <Label>Name</Label>
            </Col>
            <Col>
              <Label>Working</Label>
            </Col>
            <Col>
              <Label>Available</Label>
            </Col>
            <Col>
              <Label>Using</Label>
            </Col>
            <Col md="6">
              <Label>Tool/Equipment Number</Label>
            </Col>
          </Row>
          {dummyDataMap.get("Project 1")?.projectData.map(data => (
            <Row key={data.id}>
              <Col>{data.id}</Col>
              <Col>{data.name}</Col>
              <Col>{data.working}</Col>
              <Col>{data.available}</Col>
              <Col>{data.using}</Col>
              <Col md="6">
              <InputGroup>
              <div style={{ borderRadius: '10px', padding: '5px', border: '1px solid #ccc' }}>
              {data.workingItems && data.workingItems.map(workingItem => (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Button
                    color="secondary"
                    outline={!(toolEquipmentIdToSet[data.id]?.has(workingItem.id))}
                    onClick={(e) => handleButtonClick(data.id, e.target.innerHTML)}
                    style={{paddingRight: '15px'}}
                  >
                    {workingItem.id}
                  </Button>
                  <CloseButton style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 0
                  }}/>
                </div>
              ))}
                </div>
              </InputGroup>
              </Col>
            </Row>
          ))}
          <Row>
            <Col>
              <Button className="log-form-cancel-button" onClick={handleCancel}>Cancel</Button>
            </Col>
            <Col>
              <Button className="log-form-submit-button">Submit</Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

export default Log;

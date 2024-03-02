import { useEffect, useState } from 'react';
import React, {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Input,
  Button,
  InputGroup,
  Table,
} from 'reactstrap';
import './Log.css';
import { CloseButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

function Log() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isCheckInOutDropdownOpen, setIsCheckInOutDropdownOpen] = useState(false);
  const logFormHeading = 'Tool Equipment Daily Activities Log';
  const today = new Date().toISOString().split('T')[0];
  const [projectDropdownCaretText, setProjectDropdownCaretText] = useState('Project');
  const history = useHistory();
  const [toolEquipmentIdToSet, setToolEquipmentIdToSet] = useState([]);
  const dummyDataMap = new Map([
    [
      'Project 1',
      {
        projectData: [
          {
            id: 1,
            name: 'Item 1',
            workingItems: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }],
            working: 5,
            available: 2,
            using: 3,
          },
          {
            id: 2,
            name: 'Item 2',
            working: 8,
            available: 4,
            using: 4,
          },
        ],
      },
    ],
    // Add more projects as needed
  ]);

  const onProjectDropdownItemClick = projectName => {
    console.log(`projectName: ${projectName}`);
    console.log(JSON.stringify(dummyDataMap.get(projectName)));
    setProjectDropdownCaretText(projectName);
  };

  const handleButtonClick = (id, key) => {
    console.log(`id: ${typeof id}`);
    console.log(`key: ${typeof key}`);
    addIdToSetIfNotExists(id, key);
  };

  function addIdToSetIfNotExists(key, id) {
    setToolEquipmentIdToSet(prevState => {
      const updatedState = { ...prevState };

      if (!updatedState[key]) {
        updatedState[key] = new Set([id]);
        console.log('added id');
        console.log(`updatedState[key]: ${updatedState[key].has(id)}`);
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
        <Table>
          {/* <thead>
            <tr>
              <th>{logFormHeading}</th>
            </tr>
          </thead> */}
          <colgroup>
            <col style={{ width: '100px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '200px' }} />
          </colgroup>
          <tbody>
            <tr>
              <td>
                <div className='span-and-input-box'>
                <span className='span-text'>Date:</span>
                <Input type="date" defaultValue={today} disabled />
                </div>
              </td>

              <td>
                <div className='span-and-input-box'>
                <span className='span-text'>Project:</span>
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
                </div>
              </td>
              <td>
                <div className='span-and-input-box'>
                <span className='span-text'>Check in or Out:</span>
                <Dropdown isOpen={isCheckInOutDropdownOpen} toggle={toggleCheckInOutDropdown}>
                  <DropdownToggle caret>Check out</DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem>Check In</DropdownItem>
                    <DropdownItem>Check Out</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                </div>
              </td>
            </tr>
            <tr className="subtitle-row">
              <td>Item </td>
              <td>Quantity</td>
              <td>Daily Log Input </td>
            </tr>
            <tr>
              <td>ID </td>
              <td>Name </td>
              <td>Working </td>
              <td>Avaialable </td>
              <td>Using </td>
              <td>Tool/Equipment Number </td>
            </tr>
            {dummyDataMap.get('Project 1')?.projectData.map(data => (
              <tr key={data.id}>
                <td>{data.id}</td>
                <td>{data.name}</td>
                <td>{data.working}</td>
                <td>{data.available}</td>
                <td>{data.using}</td>
                <td>
                      <div className="input-group-div">
                      <InputGroup>
                        {data.workingItems &&
                          data.workingItems.map(workingItem => (
                            <div className="input-item-div">
                              <Button
                                tdor="secondary"
                                outline={!toolEquipmentIdToSet[data.id]?.has(workingItem.id)}
                                onClick={e => handleButtonClick(data.id, e.target.innerHTML)}
                                style={{ paddingRight: '15px' }}
                              >
                                {workingItem.id}
                              </Button>
                              <CloseButton
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  right: 0,
                                }}
                              />
                            </div>
                          ))}
                          <DropdownToggle caret />
                          </InputGroup>
                      </div>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <Button className="log-form-cancel-button" onClick={handleCancel}>
                  Cancel
                </Button>
              </td>
              <td>
                <Button className="log-form-submit-button">Submit</Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default Log;

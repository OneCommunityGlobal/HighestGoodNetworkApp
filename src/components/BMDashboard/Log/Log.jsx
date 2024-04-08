import { useEffect, useState } from 'react';
import {
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
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'; // Import the caret down icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

  const [dataIdToExpandBoolMap, setDataIdToExpandBoolMap] = useState(new Map());

  useEffect(() => {
    // Initialize dataIdToExpandBoolMap with default values
    const newDataIdToExpandBoolMap = new Map();
    dummyDataMap.forEach(project => {
      project.projectData.forEach(item => {
        if (item.id) {
          newDataIdToExpandBoolMap.set(item.id, false);
        }
      });
    });
    setDataIdToExpandBoolMap(newDataIdToExpandBoolMap);
  }, []); // Empty dependency array means this effect will run once after the initial render

  const onProjectDropdownItemClick = projectName => {
    setProjectDropdownCaretText(projectName);
  };

  function addIdToSetIfNotExists(key, id) {
    setToolEquipmentIdToSet(prevState => {
      const updatedState = { ...prevState };

      if (!updatedState[key]) {
        updatedState[key] = new Set([id]);
      } else {
        const currentSet = updatedState[key];

        if (currentSet.has(id)) {
          currentSet.delete(id);
        } else {
          currentSet.add(id);
        }
      }

      return updatedState;
    });
  }

  const handleButtonClick = (id, key) => {
    addIdToSetIfNotExists(id, key);
  };

  const handleCancel = () => history.goBack();

  const dropdownToggleClicked = dataId => {
    setDataIdToExpandBoolMap(prevState => {
      const newState = { ...prevState };
      newState[dataId] = !newState[dataId];
      return newState;
    });
  };

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
          <div className="title-label">
            <span>{logFormHeading}</span>
          </div>
          <tbody>
            <tr>
              <td colSpan="2">
                <div className="span-and-input-box">
                  <span className="span-text">Date:</span>
                  <Input type="date" defaultValue={today} disabled />
                </div>
              </td>

              <td colSpan="2">
                <div className="span-and-input-box">
                  <span className="span-text">Project:</span>
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

              <td colSpan="2">
                <div className="span-and-input-box">
                  <span className="span-text">Check in or Out:</span>
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
              <td colSpan="6">
                <span>Item</span>
                <span>Quantity</span>
                <span>Daily Log Input</span>
              </td>
            </tr>

            <tr>
              <td>ID </td>
              <td>Name </td>
              <td>Working </td>
              <td>Available </td>
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
                  <div
                    className={`input-group-div ${
                      dataIdToExpandBoolMap[data.id] ? 'expanded' : ''
                    }`}
                  >
                    <InputGroup>
                      {data.workingItems &&
                        data.workingItems
                          .slice(0, dataIdToExpandBoolMap[data.id] ? data.workingItems.length : 3) // Show all items if expanded, otherwise show first 3
                          .map(workingItem => (
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
                      <FontAwesomeIcon
                        className="input-dropdown-toggle"
                        icon={faCaretDown}
                        onClick={() => dropdownToggleClicked(data.id)}
                      />
                    </InputGroup>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="5">
                <Button className="log-form-cancel-button" onClick={handleCancel}>
                  Cancel
                </Button>
              </td>
              <td colSpan="5">
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

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
  Form, FormGroup, Label
} from 'reactstrap';
import './LogTools.css';
import { CloseButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'; // Import the caret down icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import { fetchToolTypes } from '../../../actions/bmdashboard/invTypeActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

function LogTools() {
  const toolTypes = useSelector(state => state.bmInvTypes.list);
  const projects = useSelector(state => state.bmProjects);
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // dispatch(fetchToolById(toolId));
    dispatch(fetchToolTypes());
    dispatch(fetchBMProjects());
    // dispatch(fetchReusableTypes);
    // setTimeout(()=>{
      console.log("first load. tool types: ", toolTypes)
      console.log("projects: ",projects)
    // },2000)
  }, []);

  const handleProjectSelect = event => {
    console.log('proj select. event: ', event.target.value);
  }

  const handleInOutSelect = ()=>{
    console.log("rein raus");
  }

  const handleItemCodeSelect = () => {}

  const handleCodeSelect = () => {}

  const handleCancel = ()=> {}

  return (
    <div className="page">
      <div className="log-form-container">
          
          <div className="title-label">
            <span>TOOL/EQUIPMENT DAILY ACTIVITIES LOG</span>
          </div>


   <Form>
                      <FormGroup>
                      <Input
                          id="exampleSelectMulti"
                          multiple
                          name="select-item-code"
                          type="select"
                          onChange={handleCodeSelect}
                         >
                        <option>
                          001
                        </option>
                        <option>
                          002
                        </option>
                         </Input>
                      </FormGroup>
                    </Form>

     
      <Form className='selectors'>
                <FormGroup className="select_input">
                  <Label htmlFor="dateSelect" className="selector_label">
                        Date:
                  </Label>
                  <Input type="date" defaultValue={today} disabled />
                </FormGroup>
                    <FormGroup className="select_input">
                      <Label htmlFor="projectSelect" className="selector_label">
                        Project:
                      </Label>
                      <Input
                        id="projectSelect"
                        name="projectSelect"
                        type="select"
                        onChange={handleProjectSelect}
                      >
                        {projects.map((proj)=>
                          <option 
                            key={proj._id}
                            >
                            {proj.name}
                            </option>
                        )}
                      </Input>
                     </FormGroup>

                    <FormGroup className="select_input">
                      <Label htmlFor="projectSelect" className="selector_label">
                        Check In or Out:
                      </Label>
                      <Input
                        id="inOutSelect"
                        name="inOutSelect"
                        type="select"
                        onChange={handleInOutSelect}
                      >
                        <option>
                          Check In
                        </option>
                        <option>
                          Check Out
                        </option>
                      </Input>
                     </FormGroup>
        </Form>

        <Table>
            <thead>
            <tr className="subtitle-row">
              <td colSpan="6">
                <span className='table-subtitle'>Item</span>
                <span className='table-subtitle'>Quantity</span>
                <span className='table-subtitle subtitle-highlight'>Daily Log Input</span>
              </td>
            </tr>

            <tr className='tool-type-head'>
              <td>ID </td>
              <td>Name </td>
              <td>Working </td>
              <td>Available </td>
              <td>Using </td>
              <td>Tool/Equipment Number</td>
            </tr>
            </thead>
            <tbody>
                {toolTypes && toolTypes.map((toolType, index) => (
                  <tr key={toolType.id} className='tool-type-row'>
                    <td>{index + 1}</td>
                    <td>{toolType.name}</td>
                    <td>{toolType.available.length + toolType.using.length}</td>
                    <td>{toolType.available.length}</td>
                    <td>{toolType.using.length}</td>
                    {/* <Form>
                      <FormGroup> */}
                      <Input
                          id="exampleSelectMulti"
                          // multiple
                          name="select-item-code"
                          type="select"
                          onChange={handleItemCodeSelect}
                         >
                        <option>
                          001
                        </option>
                        <option>
                          002
                        </option>
                         </Input>
                      {/* </FormGroup>
                    </Form> */}
                  </tr>
                  ))}


                    {/* <InputGroup>
                      {data.workingItems &&
                        data.workingItems
                          .slice(0, dataIdToExpandBoolMap[data.id] ? data.workingItems.length : 3) // Show all items if expanded, otherwise show first 3
                          .map(workingItem => (
                            <div className="input-item-div">
                              <Button
                                tdor="secondary"
                                // outline={!toolEquipmentIdToSet[data.id]?.has(workingItem.id)}
                                // onClick={e => handleButtonClick(data.id, e.target.innerHTML)}
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
                        // onClick={() => dropdownToggleClicked(data.id)}
                      />
                    </InputGroup> */}
                
              
          </tbody>
        </Table>
        <div className="action-buttons">
          <Button className="log-form-cancel-button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="log-form-submit-button">Submit</Button>
        </div>
      </div>
    </div>
  );
}

export default LogTools;

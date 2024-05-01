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
import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import { fetchToolTypes } from '../../../actions/bmdashboard/invTypeActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

function LogTools() {
  const toolTypes = useSelector(state => state.bmInvTypes.list);
  const toolItems = useSelector(state => state.bmTools.toolslist);
  const projects = useSelector(state => state.bmProjects);
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];
  const [selectedProject, setSelectedProject] = useState(projects[0].name)
  const [selectedAction, setSelectedAction] = useState("Check In");
  const [relevantToolItems, setRelevantToolItems] = useState([]);

  useEffect(() => {
    // dispatch(fetchToolById(toolId));
    dispatch(fetchToolTypes());
    dispatch(fetchBMProjects());
    dispatch(fetchTools());
    // dispatch(fetchReusableTypes);
    // setTimeout(()=>{
      console.log("first load. tool types: ", toolTypes)
    //   console.log("projects: ",projects)
      // console.log("toolItems: ",toolItems)
      
    //   console.log("toolItems name: ",toolItems[0].project.name)
    // // },2000)
    // setRelevantToolItems(toolItems);
    console.log("first load toolItems: ",toolItems)
  }, []);

  useEffect(()=>{
    console.log("relevantToolItems changed: ", relevantToolItems);
  },[relevantToolItems])

  useEffect(()=>{
    console.log("selectedProject or selectedAction changed. proj: ", selectedProject, ", action: ", selectedAction);
    // const unfilteredItems = relevantToolItems;
    // console.log("unfilteredItems in useEff: ", unfilteredItems)
    let filteredToolItems = [];
    const actionArray = selectedAction === "Check In" ? "using" : "available"; 
    console.log("actionArray: ", actionArray)
    // filteredToolItems = toolItems.filter((item)=> (item.project.name === selectedProject)&&(item.itemType[actionArray].length > 0));
    // console.log("filteredToolItems: ", filteredToolItems)
    // setRelevantToolItems(filteredToolItems);


  const filteredToolTypes = []

  const toolsTypesByProject = toolTypes.filter((toolType)=>{
    // toolType[actionArray]
  })

  // const arr = [
  //   {
  //     name: "Bob"
  //   },{
  //     name: "Benj"
  //   },{
  //     name: "Bellend"
  //   }
  // ]
  // const arr2 = arr.filter((item)=> item.includes)

  toolTypes.forEach((type)=> {
    // console.log("looping types. type: ", type)
    // console.log("type[",actionArray,"]: ", type[actionArray])

    if(type[actionArray].length >0){
      const typeDetails = {
        toolName: type.name,
        _id: type._id,
        using: type.using.length,
        available: type.available.length,
        items: []
      };

      type[actionArray].forEach((item)=>{
        // console.log("looping available or uring. item: ", item);
        if(item.project.name === selectedProject){
          const toolCodes = {code: item.code, _id: item._id};
          typeDetails.items.push(toolCodes);
        }else{
          return
        }
      })
      if(typeDetails.items.length > 0){ 
        filteredToolTypes.push(typeDetails)
      };
    }
    setRelevantToolItems(filteredToolTypes);
  });

console.log("filteredToolTypes: ",filteredToolTypes)

  },[selectedProject, selectedAction])

  const handleProjectSelect = event => {
    // console.log('proj select. event: ', event.target.value);
    setSelectedProject(event.target.value);
  };

  const handleInOutSelect = event =>{
    // console.log("rein raus, ", event.target.value);
    setSelectedAction(event.target.value)
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
                        value={selectedAction}
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
                {relevantToolItems.length > 0 ?
                
                  relevantToolItems.map((toolType, index)=>(
                    <tr 
                      key={toolType._id}
                      className='tool-type-row'
                    >
                       <td>{index + 1}</td>
                       <td>{toolType.toolName}</td>
                       <td>{toolType.available + toolType.using}</td>
                       <td>{toolType.available}</td>
                       <td>{toolType.using}</td>
                      <td>{toolType.items.map((item)=>(
                        <span key={item._id}>{item.code},</span>
                      ))}</td>
                    </tr>
                  ))
                
                
                : <tr><td colSpan="6">There are no tools to {selectedAction.toLowerCase()} for this project</td></tr>}

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

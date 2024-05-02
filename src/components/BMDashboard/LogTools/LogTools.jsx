import { useEffect, useState } from 'react';
import {
  Input,
  Button,
  Table,
  Form, FormGroup, Label
} from 'reactstrap';
import './LogTools.css';
import { CloseButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'; // Import the caret down icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import { fetchToolTypes } from '../../../actions/bmdashboard/invTypeActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import Select, { StylesConfig }  from 'react-select'

function LogTools() {
  const toolTypes = useSelector(state => state.bmInvTypes.list);
  // const toolItems = useSelector(state => state.bmTools.toolslist);
  const projects = useSelector(state => state.bmProjects);
  const dispatch = useDispatch();
  const today = new Date().toISOString().split('T')[0];
  const [selectedProject, setSelectedProject] = useState(projects[0].name)
  const [selectedAction, setSelectedAction] = useState("Check In");
  const [relevantToolTypes, setRelevantToolTypes] = useState([]);
  const [postObject, setPostObject] = useState({ 
      action: selectedAction,
      date: today,
      typesArray: []
    });

  const multiSelectCustomStyles = {
    control: (provided) => ({
      ...provided,
      width: 300,
    }),
    multiValue: (provided) => ({
      ...provided,
      padding: '5px',
      backgroundColor: "#f7f7f7",
      borderRadius: "5px",
      border: '1px solid #aaacaf', 
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#aaacaf',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      svg: {
        ...provided.svg,
        width: 20,
        height: 20,
      },
    }),
  };

  // 
  useEffect(() => {
    dispatch(fetchToolTypes());
    dispatch(fetchBMProjects());
  }, []);

  // useEffect(()=>{
  //   console.log("relevantToolTypes changed: ", relevantToolTypes);
  // },[relevantToolTypes])

  useEffect(()=>{
     setPostObject({ 
      action: selectedAction,
      date: today,
      typesArray: []
    })
    const actionArray = selectedAction === "Check In" ? "using" : "available"; 

  const filteredToolTypes = []

  toolTypes.forEach((type)=> {
    if(type[actionArray].length >0){
      const typeDetails = {
        toolName: type.name,
        _id: type._id,
        using: type.using.length,
        available: type.available.length,
        items: []
      };

      type[actionArray].forEach((item)=>{
        if(item.project.name === selectedProject){
          const toolCodes = {value: item._id, label: item.code, type: type._id};
          typeDetails.items.push(toolCodes);
        }else{
          return
        }
      })
      if(typeDetails.items.length > 0){ 
        filteredToolTypes.push(typeDetails)
      };
    }
    setRelevantToolTypes(filteredToolTypes);
  });
  },[selectedProject, selectedAction])

useEffect(()=>{
  console.log("postObject changed: ",postObject)  
},[postObject])


  const handleProjectSelect = event => {
    // console.log('proj select. event: ', event.target.value);
    setSelectedProject(event.target.value);
  };

  const handleInOutSelect = event =>{
    setSelectedAction(event.target.value)
   
  };

  // const handleItemCodeSelect = () => {}

  const handleCodeSelect = (event, eventParams) => {
    // console.log("event: ", event, ", eventParams: ", eventParams.action)
    // console.log("event[0]: ", event[0].value);
    const postObjCopy = {...postObject}; 

    if(eventParams.action === 'select-option'){
      // console.log("postObjCopy: ",postObjCopy)
      const idx = postObjCopy.typesArray.findIndex((obj)=> obj.toolType === event[0].type);
      if(idx < 0){
        const tempObj = {
          toolType: "",
          toolItems: [],
        }
      tempObj.toolType = event[0].type;
      tempObj.toolItems.push(event[0].value);
      postObjCopy.typesArray.push(tempObj);
    }else{
      postObjCopy.typesArray[idx].toolItems.push(event[0].value)
    }

    // console.log("postObjCopy after add: ", postObjCopy);
    }else if(eventParams.action === 'remove-value'){
      // console.log("remove chip, eventParams: ", eventParams.removedValue);
      const removedType = eventParams.removedValue.type;
      const removedItem = eventParams.removedValue.value;
      const typeIdx = postObjCopy.typesArray.findIndex((obj)=> obj.toolType === removedType);
      // console.log("postObjCopy.typesArray[typeIdx].toolItems: ",postObjCopy.typesArray[typeIdx].toolItems)
      // console.log("removedType: ",removedType, ", removedItem: ", removedItem, ", typeIdx: ", typeIdx);
      const itemIdx = postObjCopy.typesArray[typeIdx].toolItems.findIndex((item)=> item === removedItem);
      // console.log("itemIdx: ",itemIdx)
      postObjCopy.typesArray[typeIdx].toolItems.splice(itemIdx,1)
      // console.log("postObjCopy.typesArray: ", postObjCopy.typesArray[typeIdx].toolItems)
      if(postObjCopy.typesArray[typeIdx].toolItems.length === 0){
        // console.log("such empty");
        postObjCopy.typesArray.splice(typeIdx,1);
        // console.log("postObjCopy: ", postObjCopy);
      }
      
    }else if(eventParams.action === 'clear'){
      // console.log("clear, eventParams: ", eventParams);
      const clearedType = eventParams.removedValues[0].type;
      // console.log("clearedType: ", clearedType) 
      // console.log("postObjCopy.typesArray: ",postObjCopy.typesArray[0].toolType)
      postObjCopy.typesArray.forEach((type)=> console.log("type: ", type.toolType))
      const clearedTypeIdx = postObjCopy.typesArray.findIndex((type)=>type.toolType === clearedType)
      // console.log("clearedTypeIdx: ", clearedTypeIdx)
      postObjCopy.typesArray.splice(clearedTypeIdx,1)
      // console.log("postObjCopy: ", postObjCopy);
    }
  console.log("postObjCopy: ", postObjCopy);

  setPostObject(postObjCopy);
  };

  const handleCancel = ()=> {
  //redirect to /tools
  }

  const handleSubmit = ()=>{
    console.log("postObj: ", postObject);
  }

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
                {relevantToolTypes.length > 0 ?
                
                  relevantToolTypes.map((toolType, index)=>(
                    <tr 
                      key={toolType._id}
                      className='tool-type-row'
                    >
                       <td>{index + 1}</td>
                       <td>{toolType.toolName}</td>
                       <td>{toolType.available + toolType.using}</td>
                       <td>{toolType.available}</td>
                       <td>{toolType.using}</td>
                      {/* <td>{toolType.items.map((item)=>(
                        <span key={item._id}>{item.code},</span>
                      ))}</td> */}
                      <td> 
                       <Select 
                        options={toolType.items}
                        isMulti  
                        styles={multiSelectCustomStyles} 
                        onChange={handleCodeSelect}  
                        />
                      </td>  
                    </tr>
                  ))
                
                
                : <tr><td colSpan="6">There are no tools to {selectedAction.toLowerCase()} for this project</td></tr>}

          </tbody>
        </Table>
        <div className="action-buttons">
          <Button className="log-form-cancel-button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            className="log-form-submit-button" 
            onClick={handleSubmit}
            disabled={postObject.typesArray.length === 0 ? true : false} 
            >
            Submit
            </Button>
        </div>
      </div>
    </div>
  );
}

export default LogTools;

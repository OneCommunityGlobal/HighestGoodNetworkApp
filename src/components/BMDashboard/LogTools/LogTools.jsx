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
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import { fetchToolTypes, postToolsLog, resetPostToolsLog } from '../../../actions/bmdashboard/invTypeActions';
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
  const [selectCodesArray, setSelectCodesArray] = useState([]) 

  const postToolsLogResult = useSelector(state => state.bmInvTypes.postedResult);

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
    // console.log("first load. toolTypes in redux: ", toolTypes)
    // console.log("projects in redux: ", projects)
  }, []);

  useEffect(()=>{
    console.log("toolTypes changed: ", toolTypes);
  },[toolTypes])

  // useEffect(()=>{
  //   console.log("relevantToolTypes changed: ", relevantToolTypes);
  // },[relevantToolTypes])

  useEffect(()=>{
    // console.log("useEff. selectedProject or selectedAction changed");
    // console.log("selectedProject: ",selectedProject);
    // console.log("selectedAction: ",selectedAction);
    
     setPostObject({ 
      action: selectedAction,
      date: today,
      typesArray: [],
    })
    const actionArray = selectedAction === "Check In" ? "using" : "available"; 
// console.log("actionArray: ", actionArray)
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

      //ADD A FAILSAFE IN CASE NO ITEMS IN THE ARRAY??

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
  },[selectedProject, selectedAction, toolTypes])

useEffect(()=>{
  console.log("postObject changed: ",postObject);
  // console.log("[0]code: ", postObject.typesArray[0]?.toolCodes)  
},[postObject])

useEffect(()=>{
  // console.log("postToolsLogResult changed: ",postToolsLogResult);
  if(postToolsLogResult?.error === true){
    toast.error(`${postToolsLogResult?.result}`);
    dispatch(resetPostToolsLog());
  }else if(postToolsLogResult?.result !== null){
    toast.success(
      `${selectedAction} completed successfully`,
    );
    dispatch(fetchToolTypes());
    dispatch(resetPostToolsLog());

    setPostObject({ 
      action: selectedAction,
      date: today,
      typesArray: []
    })

    // console.log("After successfull post. toolTypes: ", toolTypes)

  }

},[postToolsLogResult])

  const handleProjectSelect = event => {
    // console.log('proj select. event: ', event.target.value);
    setSelectedProject(event.target.value);
  };

  const handleInOutSelect = event => {
    setSelectedAction(event.target.value);
  };

  // const handleItemCodeSelect = () => {}

  const handleCodeSelect = (event, eventParams) => {


    // console.log("event[0]: ", event[0].value);
    const postObjCopy = {...postObject}; 
    // const selectCodesArrayCopy = {...selectCodesArray};

    if(eventParams.action === 'select-option'){
      
      event.forEach((el)=>{
        // console.log("type: ", el.type, ", value: ", el.value, ", label: ", el.label);
        const idx = postObjCopy.typesArray.findIndex((obj)=> obj.toolType === el.type);
        // console.log("idx in loop: ", idx); //-1 means it's a new type, >0 means it's not
        

        if(idx < 0){

          const tempObj = {
            toolType: '',
            toolItems: [],
            toolCodes: [],
          };
          tempObj.toolType = el.type;
          tempObj.toolItems.push(el.value);
          // tempObj.toolCodes.push(el.label);

          tempObj.toolCodes.push(el);
          // // 
          // setSelectCodesArray(...selectCodesArray, el.label);
          // // 
          postObjCopy.typesArray.push(tempObj);
          

        }else{
          // console.log("idx >= 0, existing type");
          if(!postObjCopy.typesArray[idx].toolItems.includes(el.value)){
            postObjCopy.typesArray[idx].toolItems.push(el.value);
            postObjCopy.typesArray[idx].toolCodes.push(el);
            setSelectCodesArray(...selectCodesArray, el.label);
          }
        }
      })

     
    // console.log("postObjCopy after add: ", postObjCopy);
    }else if(eventParams.action === 'remove-value'){
      console.log("remove chip, eventParams: ", eventParams.removedValue);
      const removedType = eventParams.removedValue.type;
      const removedItem = eventParams.removedValue.value;
      
      const typeIdx = postObjCopy.typesArray.findIndex((obj)=> obj.toolType === removedType);
      // console.log("postObjCopy.typesArray[typeIdx].toolItems: ",postObjCopy.typesArray[typeIdx].toolItems)
      console.log("removedType: ",removedType, ", removedItem: ", removedItem, ", typeIdx: ", typeIdx);
      const itemIdx = postObjCopy.typesArray[typeIdx].toolItems.findIndex((item)=> item === removedItem);
      console.log("itemIdx: ",itemIdx)
      postObjCopy.typesArray[typeIdx].toolItems.splice(itemIdx,1);
      console.log("postObjCopy item removed: ", postObjCopy);
      //&&&
      
      postObjCopy.typesArray[typeIdx].toolCodes.splice(itemIdx,1);
      console.log("postObjCopy code removed: ", postObjCopy);
      //&&&
      
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
      // postObjCopy.typesArray.forEach((type)=> console.log("type: ", type.toolType))
      const clearedTypeIdx = postObjCopy.typesArray.findIndex((type)=>type.toolType === clearedType)
      // console.log("clearedTypeIdx: ", clearedTypeIdx)
      postObjCopy.typesArray.splice(clearedTypeIdx,1)
      // console.log("postObjCopy: ", postObjCopy);
    }
  // console.log("postObjCopy: ", postObjCopy);

  setPostObject(postObjCopy);
  };


  const handleCancel = () => {
    // const selectedProjectCopy = selectedProject;
    // const selectedActionCopy = selectedAction;
    const blankPostObj = { 
      action: selectedAction,
      date: today,
      typesArray: []
    }
  //  setSelectedAction(selectedProjectCopy)
  //  setSelectedProject(selectedActionCopy)
   setPostObject(blankPostObj)
  }

  const handleSubmit = ()=>{
    // console.log("postObj: ", postObject);
    dispatch(postToolsLog(postObject));
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
                      <td> 
                       <Select 
                        // key={`${toolType._id}${index}`}//didn't solve the problem
                        options={toolType.items}
                        isMulti  
                        // value={postObject.typesArray.length > 0 ? postObject.typesArray[index]?.toolCodes : []}
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

import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Input, Button, Table, Form, FormGroup, Label } from 'reactstrap';
import './LogTools.css';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import {
  fetchToolTypes,
  postToolsLog,
  resetPostToolsLog,
} from '../../../actions/bmdashboard/invTypeActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

function LogTools() {
  const toolTypes = useSelector(state => state.bmInvTypes.list);
  const projects = useSelector(state => state.bmProjects);
  const dispatch = useDispatch();
  const history = useHistory();
  const today = new Date().toISOString().split('T')[0];
  const [selectedProject, setSelectedProject] = useState(projects[0].name);
  const [selectedAction, setSelectedAction] = useState('Check In');
  const [relevantToolTypes, setRelevantToolTypes] = useState([]);
  const [postObject, setPostObject] = useState({
    action: selectedAction,
    date: today,
    typesArray: [],
  });
  const postToolsLogResult = useSelector(state => state.bmInvTypes.postedResult);
  const selectRefs = useRef([]);

  const clearAllSelects = () => {
    selectRefs.current.forEach(ref => {
      ref.current?.commonProps.clearValue();
    });
  };

  const clearPostObj = () => {
    setPostObject({
      action: selectedAction,
      date: today,
      typesArray: [],
    });
  };

  const multiSelectCustomStyles = {
    control: provided => ({
      ...provided,
      width: 300,
    }),
    multiValue: provided => ({
      ...provided,
      padding: '5px',
      backgroundColor: '#f7f7f7',
      borderRadius: '5px',
      border: '1px solid #aaacaf',
    }),
    multiValueLabel: provided => ({
      ...provided,
      color: '#aaacaf',
    }),
    multiValueRemove: provided => ({
      ...provided,
      svg: {
        ...provided.svg,
        width: 20,
        height: 20,
      },
    }),
  };

  useEffect(() => {
    dispatch(fetchToolTypes());
    dispatch(fetchBMProjects());
  }, []);

  useEffect(() => {
    clearAllSelects();
    clearPostObj();
    const actionArray = selectedAction === 'Check In' ? 'using' : 'available';
    const filteredToolTypes = [];

    toolTypes.forEach(type => {
      let availForSelectedProj = 0;
      let usingForSelectedProj = 0;

      type.available.forEach(availItem => {
        if (availItem.project.name === selectedProject) {
          availForSelectedProj += 1;
        }
      });

      type.using.forEach(usingItem => {
        if (usingItem.project.name === selectedProject) {
          usingForSelectedProj += 1;
        }
      });

      if (type[actionArray].length > 0) {
        const typeDetails = {
          toolName: type.name,
          _id: type._id,
          using: 0,
          available: 0,
          items: [],
        };
        if (type[actionArray].length > 0) {
          type[actionArray].forEach(item => {
            if (item.project.name === selectedProject) {
              const toolCodes = {
                value: item._id,
                label: item.code,
                type: type._id,
                name: type.name,
              };
              typeDetails.items.push(toolCodes);
            }
          });
        }
        typeDetails.available = availForSelectedProj;
        typeDetails.using = usingForSelectedProj;
        if (typeDetails.items.length > 0) {
          filteredToolTypes.push(typeDetails);
        }
      }
      setRelevantToolTypes(filteredToolTypes);
    });
  }, [selectedProject, selectedAction, toolTypes]);

  useEffect(() => {
    const numberOfRefs = relevantToolTypes.length;
    selectRefs.current = Array(numberOfRefs)
      .fill()
      .map((_, i) => selectRefs.current[i] || React.createRef());
  }, [relevantToolTypes]);

  useEffect(() => {
    if (postToolsLogResult.result && !postToolsLogResult.error) {
      const postResult = postToolsLogResult.result.results;
      postResult.forEach(res => {
        toast.success(res.message);
      });
      dispatch(fetchToolTypes());
      dispatch(resetPostToolsLog());
    } else if (postToolsLogResult.result && postToolsLogResult.error) {
      const postResult = postToolsLogResult.result;
      postResult.errors.forEach(err => {
        toast.error(err.message);
      });
      postResult.results.forEach(res => {
        toast.success(res.message);
      });
      dispatch(fetchToolTypes());
      dispatch(resetPostToolsLog());
      clearPostObj();
    }
  }, [postToolsLogResult]);

  const handleProjectSelect = event => {
    setSelectedProject(event.target.value);
  };

  const handleInOutSelect = event => {
    setSelectedAction(event.target.value);
  };

  const handleCodeSelect = (event, eventParams) => {
    const postObjCopy = { ...postObject };

    if (eventParams.action === 'select-option') {
      const tempObj = {
        toolType: '',
        toolName: '',
        toolItems: [],
        toolCodes: [],
      };
      event.forEach((el, eventElIdx) => {
        const idx = postObjCopy.typesArray.findIndex(obj => obj.toolType === el.type);
        if (idx < 0) {
          tempObj.toolType = el.type;
          tempObj.toolName = el.name;
          tempObj.toolItems.push(el.value);
          tempObj.toolCodes.push(el);
          postObjCopy.typesArray.push(tempObj);
        } else {
          const lastIdx = postObjCopy.typesArray[idx].toolItems.length - 1;
          if (eventElIdx > lastIdx) {
            postObjCopy.typesArray[idx].toolItems.push(el.value);
            postObjCopy.typesArray[idx].toolCodes.push(el);
          }
        }
      });
    } else if (eventParams.action === 'remove-value') {
      const removedType = eventParams.removedValue.type;
      const removedItem = eventParams.removedValue.value;
      const typeIdx = postObjCopy.typesArray.findIndex(obj => obj.toolType === removedType);
      const itemIdx = postObjCopy.typesArray[typeIdx].toolItems.findIndex(
        item => item === removedItem,
      );
      postObjCopy.typesArray[typeIdx].toolItems.splice(itemIdx, 1);
      postObjCopy.typesArray[typeIdx].toolCodes.splice(itemIdx, 1);
      if (postObjCopy.typesArray[typeIdx].toolItems.length === 0) {
        postObjCopy.typesArray.splice(typeIdx, 1);
      }
    } else if (eventParams.action === 'clear') {
      const clearedType = eventParams.removedValues[0]?.type;
      const clearedTypeIdx = postObjCopy.typesArray.findIndex(
        type => type.toolType === clearedType,
      );
      postObjCopy.typesArray.splice(clearedTypeIdx, 1);
    }
    setPostObject(postObjCopy);
  };

  const handleCancel = () => {
    clearPostObj();
    clearAllSelects();
    history.push('/bmdashboard/tools');
  };

  const handleSubmit = () => {
    dispatch(postToolsLog(postObject));
    clearPostObj();
    clearAllSelects();
  };

  return (
    <div className="page">
      <div className="log-form-container">
        <div className="title-label">
          <span>TOOL/EQUIPMENT DAILY ACTIVITIES LOG</span>
        </div>

        <Form className="selectors">
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
              {projects.map(proj => (
                <option key={proj._id}>{proj.name}</option>
              ))}
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
              <option>Check In</option>
              <option>Check Out</option>
            </Input>
          </FormGroup>
        </Form>

        <Table>
          <thead>
            <tr className="subtitle-row">
              <td colSpan="6">
                <span className="table-subtitle">Item</span>
                <span className="table-subtitle">Quantity</span>
                <span className="table-subtitle subtitle-highlight">Daily Log Input</span>
              </td>
            </tr>

            <tr className="tool-type-head">
              <td>ID </td>
              <td>Name </td>
              <td>Working </td>
              <td>Available </td>
              <td>Using </td>
              <td>Tool/Equipment Number</td>
            </tr>
          </thead>

          <tbody>
            {relevantToolTypes.length > 0 ? (
              relevantToolTypes.map((toolType, index) => (
                <tr key={toolType._id} className="tool-type-row">
                  <td>{index + 1}</td>
                  <td>{toolType.toolName}</td>
                  <td>{toolType.available + toolType.using}</td>
                  <td>{toolType.available}</td>
                  <td>{toolType.using}</td>
                  <td>
                    <Select
                      aria-label="Select Tool"
                      ref={selectRefs.current[index]}
                      options={toolType.items}
                      isMulti
                      styles={multiSelectCustomStyles}
                      onChange={handleCodeSelect}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  There are no tools to {selectedAction.toLowerCase()} for this project
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <div className="action-buttons">
          <Button className="log-form-cancel-button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="log-form-submit-button"
            onClick={handleSubmit}
            disabled={postObject.typesArray.length === 0}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LogTools;

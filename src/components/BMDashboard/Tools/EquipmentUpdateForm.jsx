import { useState, useEffect, useMemo } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAllEquipments } from '../../../actions/bmdashboard/equipmentActions';
import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';

const initialFormState = {
  project: '',
  toolOrEquipment: '',
  name: '',
  number: '',
};

export default function EquipmentUpdateForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();
  // Fetch dropdown data
  const projects = useSelector(state => state.bmProjects || []);
  const tools = useSelector(state => state.bmTools.toolslist || []);
  const equipments = useSelector(state => state.bmEquipments.equipmentslist || []);
  useEffect(() => {
    dispatch(fetchBMProjects());
    dispatch(fetchTools());
    dispatch(fetchAllEquipments());
  }, [dispatch]);

  // Extract list of valid tools and equipment (only where name is present)
  const toolList = useMemo(
    () =>
      tools
        .filter(
          tool => tool.project._id === formData.project && tool.itemType && tool.itemType.name,
        )
        .map(tool => ({ id: tool.itemType._id, name: tool.itemType.name })),
    [tools, formData.project],
  );

  const equipmentList = useMemo(
    () =>
      equipments
        .filter(
          equip => equip.project._id === formData.project && equip.itemType && equip.itemType.name,
        )
        .map(equip => ({ id: equip.itemType._id, name: equip.itemType.name })),
    [equipments, formData.project],
  );
  const uniqueToolList = useMemo(
    () => [...new Map(toolList.map(item => [item.id, item])).values()],
    [toolList],
  );

  const uniqueEquipmentList = useMemo(
    () => [...new Map(equipmentList.map(item => [item.id, item])).values()],
    [equipmentList],
  );
  // Update form validity
  useEffect(() => {
    const { project, toolOrEquipment, name, number } = formData;
    setIsFormValid(!!(project && toolOrEquipment && name && number));
  }, [formData]);

  // Handle input change
  // Handle input change
  const handleChange = e => {
    const { name, value } = e.target;

    // Allow only numbers in the "number" field
    if (name === 'number' && value !== '' && !/^\d+$/.test(value)) {
      return; // Ignore invalid input (non-numeric values)
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'project' || name === 'toolOrEquipment' ? { name: '', number: '' } : {}), // Reset name and number on change
    }));
  };

  // Reset form
  const handleCancel = () => {
    setFormData(initialFormState);
  };

  // Submit form
  const handleSubmit = e => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please complete all fields before updating.');
      return;
    }
    setFormData(initialFormState);
    toast.success('Tool/Equipment updated successfully!');
  };

  return (
    <div className="add-tool-form">
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="project">
            Project <span className="field-required">*</span>
          </Label>
          <Input
            type="select"
            name="project"
            id="project"
            value={formData.project}
            onChange={handleChange}
          >
            <option key="" value="">
              Select Project
            </option>
            {projects.map(proj => (
              <option key={proj._id} value={proj._id}>
                {proj.name}
              </option>
            ))}
          </Input>
          {!formData.project && <div className="toolFormError">Project is required</div>}
        </FormGroup>

        <FormGroup>
          <Label for="toolOrEquipment">
            Tool or Equipment <span className="field-required">*</span>
          </Label>
          <Input
            type="select"
            name="toolOrEquipment"
            id="toolOrEquipment"
            value={formData.toolOrEquipment}
            onChange={handleChange}
          >
            <option key="empty" value="">
              Select Tool/Equipment
            </option>
            <option key="Tool" value="Tool">
              Tool
            </option>
            <option key="Equipment" value="Equipment">
              Equipment
            </option>
          </Input>
          {!formData.toolOrEquipment && <div className="toolFormError">This field is required</div>}
        </FormGroup>

        <FormGroup>
          <Label for="name">
            Name <span className="field-required">*</span>
          </Label>
          <Input
            type="select"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!formData.toolOrEquipment}
          >
            {formData.toolOrEquipment === 'Tool' &&
              (uniqueToolList.length > 0 ? (
                <>
                  <option value="">Select Name</option>
                  {uniqueToolList.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No names available</option>
              ))}
            {formData.toolOrEquipment === 'Equipment' &&
              (uniqueEquipmentList.length > 0 ? (
                <>
                  <option value="">Select Name</option>
                  {uniqueEquipmentList.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">No names available</option>
              ))}
          </Input>
          {!formData.name &&
            (!formData.toolOrEquipment || !formData.project ? (
              <div className="toolFormError">Please select Project and Tool/Equipment first</div>
            ) : (
              <div className="toolFormError">Please select a name</div>
            ))}
        </FormGroup>

        <FormGroup>
          <Label for="number">
            Number <span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="number"
            id="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Enter number"
          />
          {!formData.number && <div className="toolFormError">Number is required</div>}
        </FormGroup>
        <div className="add-tool-buttons">
          <Button color="primary" type="submit" disabled={!isFormValid}>
            Update
          </Button>
          <Button color="secondary" type="button" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}

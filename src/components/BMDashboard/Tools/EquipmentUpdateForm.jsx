import { useState, useEffect, useMemo } from 'react';
import { Form, FormGroup, Label, Input, Button, Table } from 'reactstrap';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import { fetchAllEquipments } from '../../../actions/bmdashboard/equipmentActions';
import { fetchTools } from '../../../actions/bmdashboard/toolActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import styles from './EquipmentUpdateForm.module.css';

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

  const selectedItem = useMemo(() => {
    if (!formData.toolOrEquipment || !formData.name) return null;

    const sourceList = formData.toolOrEquipment === 'Tool' ? toolList : equipmentList;

    return (
      sourceList.find(
        item =>
          item.name === formData.name &&
          (!formData.project || String(item.projectId) === String(formData.project)),
      ) || null
    );
  }, [formData.toolOrEquipment, formData.name, formData.project, toolList, equipmentList]);

  const currentCount = selectedItem?.count ?? 0;
  const newCount = formData.number === '' ? null : Number(formData.number);

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
    <div className={styles.addToolForm}>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="project">
            Project <span className={styles.fieldRequired}>*</span>
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
          {!formData.project && <div className={styles.toolFormError}>Project is required</div>}
        </FormGroup>

        <FormGroup>
          <Label for="toolOrEquipment">
            Tool or Equipment <span className={styles.fieldRequired}>*</span>
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
          {!formData.toolOrEquipment && (
            <div className={styles.toolFormError}>This field is required</div>
          )}
        </FormGroup>

        <FormGroup>
          <Label for="name">
            Name <span className={styles.fieldRequired}>*</span>
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

        {formData.project && formData.toolOrEquipment && formData.name && (
          <div className={styles.currentCountBox}>
            <p className={styles.currentCountText}>
              Current number of selected {formData.toolOrEquipment.toLowerCase()}s:{' '}
              <strong>{currentCount}</strong>
            </p>

            <Table bordered responsive className={styles.currentCountTable}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Current Count</th>
                  <th>New Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{projects.find(proj => proj._id === formData.project)?.name || '-'}</td>
                  <td>{formData.toolOrEquipment}</td>
                  <td>{formData.name}</td>
                  <td>{currentCount}</td>
                  <td>{newCount === null ? '-' : newCount}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}

        <FormGroup>
          <Label for="number">
            Number <span className={styles.fieldRequired}>*</span>
          </Label>
          <Input
            type="text"
            name="number"
            id="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Enter number"
          />
          {!formData.number && <div className={styles.toolFormError}>Number is required</div>}
        </FormGroup>
        <div className={styles.addToolButtons}>
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

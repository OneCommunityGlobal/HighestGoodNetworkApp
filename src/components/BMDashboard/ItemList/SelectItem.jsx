import PropTypes from 'prop-types';
import { Form, FormGroup, Label, Input } from 'reactstrap';

const getConsumablesSet = (items, selectedProject) => {
  if (selectedProject === 'all') {
    return [...new Set(items.filter(m => m.name && m.name !== 'N/A').map(m => m.name))];
  }
  return [
    ...new Set(
      items
        .filter(mat => mat.project?.name === selectedProject && mat.name && mat.name !== 'N/A')
        .map(m => m.name),
    ),
  ];
};

const getConditionSet = (items, selectedProject) => {
  if (selectedProject === 'all') {
    return [...new Set(items.filter(m => m.condition).map(m => m.condition))];
  }
  return [
    ...new Set(
      items
        .filter(mat => mat.project?.name === selectedProject && mat.condition)
        .map(m => m.condition),
    ),
  ];
};

const getDefaultSet = (items, selectedProject) => {
  if (selectedProject === 'all') {
    return [...new Set(items.map(m => m.itemType?.name))];
  }
  return [
    ...new Set(
      items.filter(mat => mat.project?.name === selectedProject).map(m => m.itemType?.name),
    ),
  ];
};

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  selectedToolStatus,
  setSelectedToolStatus,
  selectedCondition,
  setSelectedCondition,
  label,
  darkMode,
}) {
  let itemSet = [];

  if (items && items.length > 0) {
    if (label === 'Consumables') {
      itemSet = getConsumablesSet(items, selectedProject);
    } else if (label === 'Tool Status') {
      itemSet = ['Using', 'Available', 'Under Maintenance'];
    } else if (label === 'Condition') {
      itemSet = getConditionSet(items, selectedProject);
    } else {
      itemSet = getDefaultSet(items, selectedProject);
    }
  }

  const darkStyle = darkMode
    ? { backgroundColor: '#1e293b', color: '#e5e7eb', borderColor: '#334155' }
    : undefined;

  const getSelectValue = () => {
    if (label === 'Condition') return selectedCondition;
    if (label === 'Tool Status') return selectedToolStatus;
    return selectedItem;
  };

  const handleSelectChange = e => {
    const val = e.target.value;
    if (label === 'Tool Status') setSelectedToolStatus(val);
    else if (label === 'Condition') setSelectedCondition(val);
    else setSelectedItem(val);
  };

  return (
    <Form>
      <FormGroup className="select_input">
        <Label
          htmlFor="select-item"
          style={{ marginLeft: '10px', color: darkMode ? 'white' : 'inherit' }}
        >
          {label ? `${label}:` : 'Material:'}
        </Label>
        <Input
          id="select-item"
          name="select-item"
          type="select"
          value={getSelectValue() || ''}
          onChange={handleSelectChange}
          disabled={!itemSet.length}
          style={darkStyle}
        >
          {itemSet.length > 0 ? (
            <>
              <option value="all">All</option>
              {itemSet.map(name => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </>
          ) : (
            <option>No data</option>
          )}
        </Input>
      </FormGroup>
    </Form>
  );
}

SelectItem.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      condition: PropTypes.string,
      project: PropTypes.shape({ name: PropTypes.string }),
      itemType: PropTypes.shape({ name: PropTypes.string }),
    }),
  ).isRequired,
  selectedProject: PropTypes.string,
  selectedItem: PropTypes.string,
  setSelectedItem: PropTypes.func,
  selectedToolStatus: PropTypes.string,
  setSelectedToolStatus: PropTypes.func,
  selectedCondition: PropTypes.string,
  setSelectedCondition: PropTypes.func,
  label: PropTypes.string,
  darkMode: PropTypes.bool,
};

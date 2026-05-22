import { Form, FormGroup, Label, Input } from 'reactstrap';

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

  if (items?.length) {
    if (label === 'Consumables') {
      if (selectedProject === 'all') {
        itemSet = [...new Set(items.filter(m => m.name && m.name !== 'N/A').map(m => m.name))];
      } else {
        itemSet = [
          ...new Set(
            items
              .filter(
                mat => mat.project?.name === selectedProject && mat.name && mat.name !== 'N/A',
              )
              .map(m => m.name),
          ),
        ];
      }
    } else if (label === 'Tool Status') {
      itemSet = ['Using', 'Available', 'Under Maintenance'];
    } else if (label === 'Condition') {
      if (selectedProject === 'all') {
        itemSet = [...new Set(items.filter(m => m.condition).map(m => m.condition))];
      } else {
        itemSet = [
          ...new Set(
            items
              .filter(mat => mat.project?.name === selectedProject && mat.condition)
              .map(m => m.condition),
          ),
        ];
      }
    } else {
      if (selectedProject === 'all') {
        itemSet = [...new Set(items.map(m => m.itemType?.name))];
      } else {
        itemSet = [
          ...new Set(
            items.filter(mat => mat.project?.name === selectedProject).map(m => m.itemType?.name),
          ),
        ];
      }
    }
  }

  const darkStyle = darkMode
    ? { backgroundColor: '#1e293b', color: '#e5e7eb', borderColor: '#334155' }
    : undefined;

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
          value={
            label === 'Condition'
              ? selectedCondition
              : label === 'Tool Status'
              ? selectedToolStatus
              : selectedItem
          }
          onChange={e => {
            const val = e.target.value;
            if (label === 'Tool Status') setSelectedToolStatus(val);
            else if (label === 'Condition') setSelectedCondition(val);
            else setSelectedItem(val);
          }}
          disabled={!itemSet.length}
          style={darkStyle}
        >
          {itemSet.length ? (
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

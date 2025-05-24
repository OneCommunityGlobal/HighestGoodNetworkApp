import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  label,
}) {
  let itemSet = [];
  if (items.length) {
    if (selectedProject === 'all') {
      const uniqueNames = new Set();
      itemSet = items
        .filter(item => {
          const name = item.itemType?.name;
          if (!name || uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
        })
        .map(item => ({
          name: item.itemType?.name,
          id: item.id || item._id, // Use existing id if available
        }));
    } else {
      const uniqueNames = new Set();
      itemSet = items
        .filter(item => item.project?.name === selectedProject)
        .filter(item => {
          const name = item.itemType?.name;
          if (!name || uniqueNames.has(name)) return false;
          uniqueNames.add(name);
          return true;
        })
        .map(item => ({
          name: item.itemType?.name,
          id: item.id || item._id,
        }));
    }
  }

  return (
    <Form>
      <FormGroup className="select_input">
        <Label htmlFor="select-material" style={{ marginLeft: '10px' }}>
          {label ? `${label}:` : 'Material:'}
        </Label>
        <Input
          id="select-item"
          name="select-item"
          type="select"
          value={selectedItem}
          onChange={e => setSelectedItem(e.target.value)}
          disabled={!items.length}
        >
          {items.length ? (
            <>
              <option value="all" key="all-option">
                All
              </option>
              {itemSet.map(item => (
                <option key={`item-${item.id || item.name}`} value={item.name}>
                  {item.name}
                </option>
              ))}
            </>
          ) : (
            <option key="no-data">No data</option>
          )}
        </Input>
      </FormGroup>
    </Form>
  );
}

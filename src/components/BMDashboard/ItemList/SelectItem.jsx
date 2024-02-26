import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
}) {

  let itemSet = [];
  if (items.length) {
    if (selectedProject === 'all') itemSet = [...new Set(items.map(m => m.itemType?.name))];
    else
      itemSet = [
        ...new Set(
          items.filter(mat => mat.project?.name === selectedProject).map(m => m.itemType?.name),
        ),
      ];
  }

  return (
    <Form>
      <FormGroup className="select_input">
        <Label htmlFor="select-material" style={{ marginLeft: '10px' }}>
          Material:
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
              <option value="all">All</option>
              {itemSet.map(name => {
                return (
                  <option key={name} value={name}>
                    {name}
                  </option>
                );
              })}
            </>
          ) : (
            <option>No data</option>
          )}
        </Input>
      </FormGroup>
    </Form>
  );
}

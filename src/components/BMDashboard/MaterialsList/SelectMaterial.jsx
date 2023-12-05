import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectForm({
  materials,
  selectedProject,
  selectedMaterial,
  setSelectedMaterial,
}) {
  // create selectable projects
  let materialSet = [];
  if (materials.length) {
    if (selectedProject === 'all')
      materialSet = [...new Set(materials.map(m => m.itemType?.name))];
    else
      materialSet = [
        ...new Set(
          materials
            .filter(mat => mat.project.name === selectedProject)
            .map(m => m.itemType?.name),
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
          id="select-material"
          name="select-material"
          type="select"
          value={selectedMaterial}
          onChange={e => setSelectedMaterial(e.target.value)}
          disabled={!materials.length}
        >
          {materials.length ? (
            <>
              <option value="all">All</option>
              {materialSet.map(name => {
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

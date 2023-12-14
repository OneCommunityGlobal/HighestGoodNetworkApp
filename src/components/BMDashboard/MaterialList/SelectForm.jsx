import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectForm({ materials, setSelectedProject, setSelectedMaterial }) {
  const projectSet = [...new Set(materials.map(mat => mat.project.name))];
  const materialSet = [...new Set(materials.map(mat => mat.itemType.name))];

  return (
    <Form>
      <FormGroup className="select_input">
        <Label htmlFor="select-project">Project:</Label>
        <Input
          id="select-project"
          name="select-project"
          type="select"
          onChange={({ target }) => setSelectedProject(target.value)}
          disabled={!materials.length}
        >
          {materials.length ? (
            <>
              <option value="all">All</option>
              {projectSet.map(name => {
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
        <Label htmlFor="select-material" style={{ marginLeft: '10px' }}>
          Material:
        </Label>
        <Input
          id="select-material"
          name="select-material"
          type="select"
          // value={selectedMaterial}
          onChange={({ target }) => setSelectedMaterial(target.value)}
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

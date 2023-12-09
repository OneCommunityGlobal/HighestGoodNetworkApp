import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectForm({ materials, setSelectedProject, setSelectedMaterial }) {
  // create selectable projects
  let projectsSet = [];
  if (materials.length) {
    projectsSet = [...new Set(materials.map(mat => mat.project?.name))];
  }

  const handleChange = event => {
    setSelectedMaterial('all');
    setSelectedProject(event.target.value);
  };

  return (
    <Form>
      <FormGroup className="select_input">
        <Label htmlFor="select-project">Project:</Label>
        <Input
          id="select-project"
          name="select-project"
          type="select"
          onChange={handleChange}
          disabled={!materials.length}
        >
          {materials.length ? (
            <>
              <option value="all">All</option>
              {projectsSet.map(name => {
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

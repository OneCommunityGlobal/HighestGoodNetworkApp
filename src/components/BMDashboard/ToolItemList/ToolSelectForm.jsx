import { Form, FormGroup, Label, Input } from 'reactstrap';

export default function SelectForm({ items, setSelectedProject, setSelectedItem }) {
  // console.log("SelectForm. items: ", items, ", setSelectedProject: ",setSelectedProject, ", setSelectedItem: ", setSelectedItem);
  // console.log("SelectForm. items: ", items)
  let projectsSet = [];
  if (items.length) {
    projectsSet = [...new Set(items.map(el => el.project?.name))];
    // console.log("projectsSet: ", projectsSet);
  }

  const handleChange = event => {
    setSelectedItem('all');
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
          disabled={!items.length}
        >
          {items.length ? (
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

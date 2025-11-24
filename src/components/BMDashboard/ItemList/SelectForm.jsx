import { Form, FormGroup, Label, Input } from 'reactstrap';
import { useSelector } from 'react-redux';

export default function SelectForm({ items, setSelectedProject, setSelectedItem }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  let projectsSet = [];
  if (items.length) {
    projectsSet = [...new Set(items.map(el => el.project?.name))];
  }

  const handleChange = event => {
    setSelectedItem('all');
    setSelectedProject(event.target.value);
  };

  return (
    <Form
      className=""
      style={{}}
    >
      <FormGroup
        className="select_input"
        style={{}}
      >
        <Label
          htmlFor="select-project"
          className=""
          style={{ color: darkMode ? 'white' : 'inherit' }}
        >
          Project:
        </Label>
        <Input
          id="select-project"
          name="select-project"
          type="select"
          onChange={handleChange}
          disabled={!items.length}
          className=""
          style={{ color: darkMode ? 'white' : 'inherit' }}
        >
          {items.length ? (
            <>
              <option
                value="all"
                className=""
                style={{ color: darkMode ? 'white' : 'inherit' }}
              >
                All
              </option>
              {projectsSet.map(name => {
                return (
                  <option
                    key={name}
                    value={name}
                    className=""
                    style={{ color: darkMode ? 'white' : 'inherit' }}
                  >
                    {name}
                  </option>
                );
              })}
            </>
          ) : (
            <option
              className=""
              style={{ color: darkMode ? 'white' : 'inherit' }}
            >
              No data
            </option>
          )}
        </Input>
      </FormGroup>
    </Form>
  );
}

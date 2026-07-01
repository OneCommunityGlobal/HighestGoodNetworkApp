import { Form, FormGroup, Label, Input } from 'reactstrap';
import { useSelector } from 'react-redux';

export default function SelectForm({ items, setSelectedProject, setSelectedItem }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  // In dark mode the native <select>/<option> default to a white background, which
  // left the white option text invisible. Give them an explicit dark surface.
  const darkControlStyle = darkMode
    ? { color: 'white', backgroundColor: '#1e2632' }
    : { color: 'inherit' };
  const darkOptionStyle = darkMode
    ? { color: 'white', backgroundColor: '#1e2632' }
    : { color: 'inherit' };

  let projectsSet = [];
  if (items.length) {
    projectsSet = [...new Set(items.map(el => el.project?.name))];
  }

  const handleChange = event => {
    setSelectedItem('all');
    setSelectedProject(event.target.value);
  };

  return (
    <Form>
      <FormGroup className="select_input">
        <Label htmlFor="select-project" style={{ color: darkMode ? 'white' : 'inherit' }}>
          Project:
        </Label>
        <Input
          id="select-project"
          name="select-project"
          type="select"
          onChange={handleChange}
          disabled={!items.length}
          style={darkControlStyle}
        >
          {items.length ? (
            <>
              <option value="all" style={darkOptionStyle}>
                All
              </option>
              {projectsSet.map(name => (
                <option key={name} value={name} style={darkOptionStyle}>
                  {name}
                </option>
              ))}
            </>
          ) : (
            <option style={darkOptionStyle}>No data</option>
          )}
        </Input>
      </FormGroup>
    </Form>
  );
}

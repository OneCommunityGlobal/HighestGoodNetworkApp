import { Form, FormGroup, Label, Input } from 'reactstrap';
import styles from './ItemListView.module.css';

export default function SelectForm({
  items,
  setSelectedProject,
  setSelectedItem,
  selectedProject, // optional (controlled)
  selectedItem, // optional (controlled)
}) {
  let projectsSet = [];
  if (items.length) {
    projectsSet = [...new Set(items.map(el => el.project?.name))];
  }

  const handleChange = event => {
    const newProject = event.target.value;

    const toolsForNewProject =
      newProject === 'all'
        ? [...new Set(items.map(m => m.itemType?.name).filter(Boolean))]
        : [
            ...new Set(
              items
                .filter(mat => mat.project?.name === newProject && mat.itemType?.name)
                .map(m => m.itemType.name),
            ),
          ];

    if (typeof setSelectedItem === 'function') {
      // If controlled, only reset tool if invalid under new project
      if (typeof selectedItem !== 'undefined') {
        if (selectedItem !== 'all' && !toolsForNewProject.includes(selectedItem)) {
          setSelectedItem('all');
        }
      } else {
        // Backwards compatibility (uncontrolled)
        setSelectedItem('all');
      }
    }

    setSelectedProject(newProject);
  };

  const isControlled = typeof selectedProject !== 'undefined';

  return (
    <Form>
      <FormGroup className={`${styles.selectInput}`}>
        <Label htmlFor="select-project">Project:</Label>
        <Input
          id="select-project"
          name="select-project"
          type="select"
          onChange={handleChange}
          disabled={!items.length}
          value={isControlled ? selectedProject : undefined}
        >
          {items.length ? (
            <>
              <option value="all">All</option>
              {projectsSet.map(name => (
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

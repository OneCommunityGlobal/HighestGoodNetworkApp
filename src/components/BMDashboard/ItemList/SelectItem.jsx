import { Form, FormGroup, Label, Input } from 'reactstrap';
import styles from './ItemListView.module.css';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  label,
  darkMode,
}) {
  let itemSet = [];
  if (items?.length) {
    if (selectedProject === 'all') {
      itemSet = [
        ...new Set(
          items
            .filter(m => m.itemType?.name) // Filter out items with null/undefined names
            .map(m => m.itemType.name),
        ),
      ];
    } else {
      itemSet = [
        ...new Set(
          items
            .filter(mat => mat.project?.name === selectedProject && mat.itemType?.name)
            .map(m => m.itemType.name),
        ),
      ];
    }
  }

  return (
    <Form>
      <FormGroup className={`${styles.selectInput}`}>
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
          className={darkMode ? 'bg-space-cadet text-light' : ''}
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

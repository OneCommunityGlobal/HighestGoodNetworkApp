import { Form, FormGroup, Label, Input } from 'reactstrap';
import { useSelector } from 'react-redux';
import styles from './ItemListView.module.css';

export default function SelectItem({
  items,
  selectedProject,
  selectedItem,
  setSelectedItem,
  selectedToolStatus,
  setSelectedToolStatus,
  selectedCondition,
  setSelectedCondition,
  label,
}) {
  let itemSet = [];
  const darkMode = useSelector(state => state.theme.darkMode);
  if (items?.length) {
    if (label === 'Materials') {
      if (selectedItem === 'all') {
        itemSet = [...new Set(items.filter(m => m?.name).map(m => m.name))];
      } else {
        itemSet = [
          ...new Set(items.filter(mat => mat?.name === selectedItem && mat?.name).map(m => m.name)),
        ];
      }
    }

    if (label === 'Tool') {
      if (selectedProject === 'all') {
        itemSet = [...new Set(items.filter(m => m.itemType?.name).map(m => m.itemType.name))];
      } else {
        itemSet = [
          ...new Set(
            items
              .filter(mat => mat.project?.name === selectedProject && mat.itemType?.name)
              .map(m => m.itemType.name),
          ),
        ];
      }
    } else if (label === 'Tool Status') {
      itemSet = ['Using', 'Available', 'Under Maintenance'];
    } else if (label === 'Condition') {
      if (selectedProject === 'all') {
        itemSet = [...new Set(items.filter(m => m.condition).map(m => m.condition))];
      } else {
        itemSet = [
          ...new Set(
            items
              .filter(mat => mat.project?.name === selectedProject && mat.condition)
              .map(m => m.condition),
          ),
        ];
      }
    }
  }

  return (
    <Form>
      <FormGroup className={`${styles.selectInput} ${darkMode ? styles.darkBg : ''}`}>
        <Label htmlFor="select-material">{label ? `${label}:` : 'Material:'}</Label>

        <Input
          id="select-item"
          name="select-item"
          type="select"
          value={
            label === 'Condition'
              ? selectedCondition
              : label === 'Tool Status'
              ? selectedToolStatus
              : selectedItem
          }
          onChange={e => {
            const val = e.target.value;
            if (label === 'Tool Status') {
              setSelectedToolStatus(val);
            } else if (label === 'Condition') {
              setSelectedCondition(val);
            } else {
              setSelectedItem(val);
            }
          }}
          disabled={!itemSet.length}
        >
          {itemSet.length ? (
            <>
              <option value="all" key="all-option">
                All
              </option>
              {itemSet.map(item => (
                <option key={`item-${item}`} value={item}>
                  {item}
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

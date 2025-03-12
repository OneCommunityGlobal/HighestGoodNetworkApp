import * as Diff from 'diff';
import { useSelector } from 'react-redux';

function DiffedText({ oldText, newText }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const oldTextValue = oldText ?? ''; // Use nullish coalescing to default to an empty string
  const newTextValue = newText ?? '';

  const diffParts = Diff.diffWords(oldTextValue, newTextValue, { ignoreCase: true });

  return (
    <>
      {diffParts.map(part => {
        let color = 'black'; // Default color
        if (part.added) {
          color = 'green';
        } else if (part.removed) {
          color = 'red';
        } else if (darkMode) {
          color = 'white';
        }

        return (
          <span
            style={{
              color,
              fontWeight: 'bold',
              textDecorationLine: part.removed ? 'line-through' : '',
            }}
            key={part.value + part.added + part.removed} // Use part properties to ensure unique key
          >
            {part.value}
          </span>
        );
      })}
    </>
  );
}

export default DiffedText;

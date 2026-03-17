import * as Diff from 'diff';
import { useSelector } from 'react-redux';

// Hash function for unique keys
function hashString(str) {
  let hash = 1;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1_000_000_007;
  }
  return hash.toString();
}

function DiffedText({ oldText, newText }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const oldT = oldText || '';
  const newT = newText || '';

  return (
    <>
      {Diff.diffWords(oldT, newT, { ignoreCase: true }).map(part => {
        let color = 'black';
        let textDecoration = '';
        let keySuffix = 'k';

        if (part.added) {
          color = 'green';
          keySuffix = 'a';
        } else if (part.removed) {
          color = 'red';
          textDecoration = 'line-through';
          keySuffix = 'r';
        } else if (darkMode) {
          color = 'white';
        }

        const key = `${hashString(part.value)}-${keySuffix}`;

        return (
          <span style={{ color, fontWeight: 'bold', textDecorationLine: textDecoration }} key={key}>
            {part.value}
          </span>
        );
      })}
    </>
  );
}

export default DiffedText;

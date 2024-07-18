import React from 'react';
import * as Diff from 'diff';
import { useSelector } from 'react-redux';

const DiffedText = ({ oldText, newText }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (oldText == null) {
    oldText = '';
  }
  if (newText == null) {
    newText = '';
  }
  return (
    <>
      {Diff.diffWords(oldText, newText, { ignoreCase: true }).map((part, index) => (
        <span
          style={{
            color: part.added ? 'green' : part.removed ? 'red' : darkMode ? 'white' : 'black',
            fontWeight: 'bold',
            textDecorationLine: part.removed ? 'line-through' : '',
          }}
          key={`${part.value}${index}`}
        >
          {part.value}
        </span>
      ))}
    </>
  );
};
export default DiffedText;

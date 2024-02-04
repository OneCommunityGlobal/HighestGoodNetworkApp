import React from 'react';
import * as Diff from 'diff';

const DiffedText = ({ oldText, newText }) => {
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
            color: part.added ? 'green' : part.removed ? 'red' : 'black',
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

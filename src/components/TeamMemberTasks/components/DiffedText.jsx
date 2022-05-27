import React from 'react';
import * as Diff from 'diff';

const DiffedText = ({ oldText, newText }) => (
  <>
    {Diff.diffWords(oldText, newText, { ignoreCase: true }).map((part, index) => (
      <span
        style={{ color: part.added ? 'green' : part.removed ? 'red' : 'black', fontWeight: 'bold' }}
        key={`${part.value}${index}`}
      >
        {part.value}
      </span>
    ))}
  </>
);
export default DiffedText;

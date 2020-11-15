import React from 'react'
import * as Diff from 'diff'

const DiffedText = ({ oldText, newText }) => (
  <>
    {Diff.diffChars(oldText, newText).map(part => (
      <span
        style={{ color: part.added ? 'green' : part.removed ? 'red' : 'black', fontWeight: 'bold' }}
      >
        {part.value}
      </span>
    ))}
  </>
)
export default DiffedText

import React from 'react';
import { render } from '@testing-library/react';
import RichTextEditor from '../RichTextEditor';

// keeps the props the editor gets, so the test can read its settings
const { editorProps } = vi.hoisted(() => ({ editorProps: {} }));

vi.mock('@tinymce/tinymce-react', () => ({
  Editor: props => {
    editorProps.current = props;
    return null;
  },
}));

describe('RichTextEditor', () => {
  // TinyMCE must write characters such as curly quotes, long dashes or the hidden joiner in some
  // emojis the same way as the DOMPurify-cleaned value it gets back; otherwise it rolls back and
  // drops typed letters
  it('writes only &nbsp; as a named entity', () => {
    render(<RichTextEditor value="<p>Saved text</p>" onEditorChange={() => {}} />);

    expect(editorProps.current.init.entity_encoding).toBe('named');
    expect(editorProps.current.init.entities).toBe('160,nbsp');
  });
});

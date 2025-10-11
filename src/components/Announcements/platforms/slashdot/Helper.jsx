import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function SlashdotHelper() {
  const { id } = useParams();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get(`/api/slashdot/drafts/${id}`);
      setDraft(data);
    })();
  }, [id]);

  const copy = t => navigator.clipboard.writeText(t || '');

  if (!draft) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 760, margin: '24px auto', padding: 12 }}>
      <h2>Slashdot Submit Helper</h2>
      <ol>
        <li>
          Open{' '}
          <a href="https://slashdot.org/submit" target="_blank" rel="noreferrer">
            slashdot.org/submit
          </a>{' '}
          and ensure you’re logged in.
        </li>
        <li>Copy each field below and paste into the form; then Preview/Submit.</li>
      </ol>
      <Field title="Headline" value={draft.headline} copy={copy} />
      <Field title="Source URL" value={draft.url} copy={copy} />
      <Field title="Dept" value={draft.dept} copy={copy} />
      <Field title="Tags" value={draft.tags} copy={copy} />
      <Field title="Intro / Summary" value={draft.intro} copy={copy} />
    </div>
  );
}

function Field({ title, value, copy }) {
  return (
    <div style={{ margin: '12px 0' }}>
      <h4 style={{ margin: '0 0 6px' }}>{title}</h4>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          background: '#fafafa',
          padding: 8,
          border: '1px solid #eee',
        }}
      >
        {value || '—'}
      </pre>
      <button onClick={() => copy(value)}>Copy</button>
    </div>
  );
}

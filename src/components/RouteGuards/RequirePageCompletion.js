import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useTSAForm } from 'context/TSAFormContext';

function RequirePageCompletion({ page, children }) {
  const history = useHistory();
  const { submittedPages, formLocked } = useTSAForm();

  const hasMounted = useRef(false);

  useEffect(() => {
    // Wait until initial hydration from localStorage
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const prevPagesCompleted = Array.from({ length: page - 1 }, (_, i) => i + 1).every(
      num => submittedPages[num],
    );

    const firstIncomplete = Array.from({ length: page - 1 }, (_, i) => i + 1).find(
      num => !submittedPages[num],
    );

    if (formLocked) {
      if (page === 8 && submittedPages[7]) return;

      if (firstIncomplete) {
        history.replace(`/tsaformpage/page${firstIncomplete}`);
      } else {
        history.replace('/tsaformpage/page1');
      }
      return;
    }

    if (!prevPagesCompleted && firstIncomplete) {
      history.replace(`/tsaformpage/page${firstIncomplete}`);
    }
  }, [page, submittedPages, formLocked, history]);

  return children;
}

export default RequirePageCompletion;

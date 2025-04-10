import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTSAForm } from 'context/TSAFormContext';

/**
 * Guards a page so that it can only be accessed if all previous pages are submitted.
 * @param {number} page - The current form page number.
 * @param {React.ReactNode} children - The component to render if allowed.
 */
function RequirePageCompletion({ page, children }) {
  const history = useHistory();
  const { submittedPages } = useTSAForm();

  useEffect(() => {
    const prevPagesCompleted = Array.from({ length: page - 1 }, (_, i) => i + 1).every(
      pageNum => submittedPages[pageNum],
    );

    if (!prevPagesCompleted) {
      const firstIncomplete = Array.from({ length: page - 1 }, (_, i) => i + 1).find(
        num => !submittedPages[num],
      );
      history.replace(`/tsaformpage/page${firstIncomplete}`);
    }
  }, [page, submittedPages, history]);

  return children;
}

export default RequirePageCompletion;

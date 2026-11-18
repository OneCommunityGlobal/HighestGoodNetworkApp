import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'reactstrap';

const ADMIN_ROLES = new Set(['Administrator', 'Owner']);

const QuestionnaireResultsAccessGuard = ({ children, getStatus }) => {
  const requestor = useSelector(state => state.auth.user);
  const userRole = requestor?.role || '';

  const isAdmin = ADMIN_ROLES.has(userRole);

  const [loading, setLoading] = useState(!isAdmin);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const checkQuestionnaireStatus = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await getStatus();

        if (isMounted) {
          setHasCompleted(response?.completed === true);
        }
      } catch (err) {
        console.error('Unable to verify questionnaire completion:', err);

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void checkQuestionnaireStatus();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, getStatus]);

  if (isAdmin) {
    return children;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <h4>Unable to verify questionnaire status</h4>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (!hasCompleted) {
    return (
      <div className="text-center p-5">
        <h4>Access Restricted</h4>
        <p>Please complete the HGN Skills Questionnaire to access questionnaire results.</p>
        <a href="/hgnform/page1" className="btn btn-primary">
          Complete Questionnaire
        </a>
      </div>
    );
  }

  return children;
};

export default QuestionnaireResultsAccessGuard;

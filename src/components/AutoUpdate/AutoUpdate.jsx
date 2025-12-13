import { Container, Row, Col, Alert } from 'reactstrap';
import { useState, useEffect } from 'react';

function AutoUpdate() {
  const SECOND = 1000;
  const MINUTE = 60 * SECOND;

  const [updated, setUpdated] = useState(false);
  const [hash, setHash] = useState(undefined);

  const noCacheHeaders = new Headers();
  noCacheHeaders.append('pragma', 'no-cache');
  noCacheHeaders.append('cache-control', 'no-cache');

  const requestParams = {
    method: 'GET',
    headers: noCacheHeaders,
  };

  const resolveHashUrl = () => {
    const isTestEnv =
      (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') ||
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test');

    if (isTestEnv || typeof window === 'undefined' || !window.location) {
      return null;
    }
    return new URL('/hash.txt', window.location.origin).toString();
  };

  useEffect(() => {
    const hashUrl = resolveHashUrl();
    if (!hashUrl || typeof fetch === 'undefined') {
      return undefined;
    }

    let isMounted = true;
    fetch(hashUrl, requestParams)
      .then(response => response.text())
      .then(text => {
        if (isMounted) {
          setHash(text);
        }
      })
      .catch(err => {
        console.error(err); // eslint-disable-line no-console
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hash === undefined) {
      return undefined;
    }

    const hashUrl = resolveHashUrl();
    if (!hashUrl || typeof fetch === 'undefined') {
      return undefined;
    }

    const interval = setInterval(() => {
      fetch(hashUrl, requestParams)
        .then(response => response.text())
        .then(text => {
          if (text !== hash) {
            setUpdated(true);
          }
        })
        .catch(err => {
          console.error(err); // eslint-disable-line no-console
        });
    }, 5 * MINUTE);
    return () => clearInterval(interval);
  }, [hash]);

  if (!updated) return null;

  return (
    <Container fluid>
      <Row>
        <Col sm={{ size: 12 }}>
          <Alert color="warning">
            <b>Alert:</b> The Highest Good Network application has updated! Please refresh this page
            after saving your work to apply the latest updates and bug fixes.
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}

export default AutoUpdate;

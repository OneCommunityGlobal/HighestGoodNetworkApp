import { Container, Row, Col, Alert } from 'reactstrap';
import { useState, useEffect } from 'react';

const AutoUpdate = () => {
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

  const hashRequest = new Request('/hash.txt');

  useEffect(() => {
    fetch(hashRequest, requestParams)
      .then((response) => {
        response.text().then((text) => {
          setHash(text);
        });
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    if (hash !== undefined) {
      const interval = setInterval(() => {
        fetch(hashRequest, requestParams)
          .then((response) => {
            response.text().then((text) => {
              if (text !== hash) {
                setUpdated(true);
              }
            });
          })
          .catch((err) => {});
      }, 5 * MINUTE);

      return () => clearInterval(interval);
    }
  }, [hash]);

  if (!updated) return <></>;

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
};

export default AutoUpdate;

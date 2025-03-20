import { Button, CardBody, Row, Col, Container } from 'reactstrap';
import { useState, useEffect } from 'react';
import moment from 'moment';
import './BMTimeLogCard.css';

function BMTimeLogStopWatch() {
  const [time, setTime] = useState({
    sec: 0,
    min: 0,
    hr: 0,
  });

  const [currentTime, setCurrentTime] = useState('');
  const [intervalId, setIntervalId] = useState(null);
  const [startButtonText, setStartButtonText] = useState('START');
  const [isStarted, setIsStarted] = useState(false);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isStarted) {
      const id = setInterval(() => {
        setTime(prev => {
          let sec = prev.sec + 1;
          let { min } = prev;
          let { hr } = prev;

          if (sec === 60) {
            sec = 0;
            min += 1;
          }
          if (min === 60) {
            min = 0;
            hr += 1;
          }

          return { sec, min, hr };
        });
      }, 1000);

      setIntervalId(id);
      return () => clearInterval(id);
    }
    clearInterval(intervalId);
    setIntervalId(null);
  }, [isStarted]);

  const startStop = () => {
    if (isStarted) {
      setStartButtonText('START');
    } else {
      if (!currentTime) setCurrentTime(moment().format('hh:mm:ss A'));
      setStartButtonText('PAUSE');
    }
    setIsStarted(!isStarted);
  };

  const stop = () => {
    clearInterval(intervalId);
  };

  const clear = () => {
    stop();
    setTime({ sec: 0, min: 0, hr: 0 });
    setCurrentTime('');
    setStartButtonText('START');
    setIsStarted(false);
  };

  return (
    <CardBody style={{ width: '90%' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs="auto" className="text-center d-flex justify-content-center">
            <Button className="member-stopwatch mb-2 px-4">
              {`${String(time.hr).padStart(2, '0')} : ${String(time.min).padStart(
                2,
                '0',
              )} : ${String(time.sec).padStart(2, '0')}`}
            </Button>
          </Col>
        </Row>

        <Row className="justify-content-between mb-1">
          <Button className={isStarted ? 'member-pause' : 'member-start'} onClick={startStop}>
            <b>{startButtonText}</b>
          </Button>

          <Button className="member-stop" onClick={stop}>
            <b>STOP</b>
          </Button>
        </Row>
        <Row className="mb-1">
          Start at:
          <Col>
            <b className="font-color-gray">{currentTime}</b>
          </Col>
        </Row>
        {/* <Row className="mb-2">Task: </Row> */}
        <Row className="justify-content-center">
          <Button className="member-clear" onClick={clear}>
            <b>CLEAR</b>
          </Button>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;

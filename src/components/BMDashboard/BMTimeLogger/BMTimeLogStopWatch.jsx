import { Button, CardBody, Row, Container } from 'reactstrap';
import { useState } from 'react';
import moment from 'moment';
import './BMTimeLogCard.css';

function BMTimeLogStopWatch() {
  const [time, setTime] = useState({
    sec: 0,
    min: 0,
    hr: 0,
  });

  const [currentTime, setCurrentTime] = useState();

  const [intervalId, setIntervalId] = useState();

  const updateTimer = () => {
    setTime(prev => {
      const newTime = { ...prev };
      // update sec and see if we need to increase min
      if (newTime.sec < 59) newTime.sec += 1;
      else {
        newTime.min += 1;
        newTime.sec = 0;
      }
      // min has increased in *newTime* by now if it was updated, see if it has crossed 59
      if (newTime.min === 60) {
        newTime.min = 0;
        newTime.hr += 1;
      }

      return newTime;
    });
  };

  const start = () => {
    if (!intervalId) {
      const id = setInterval(updateTimer, 1000);
      setIntervalId(id);

      if (!currentTime) {
        const date = moment();
        const hour = date.hours();
        const min = date.minutes();
        const sec = date.seconds();
        const ctime = `${hour} : ${min} : ${sec}`;
        setCurrentTime(ctime);
      }
    }
  };

  const stop = () => {
    clearInterval(intervalId);
    setIntervalId('');
  };

  const clear = () => {
    clearInterval(intervalId);
    setTime({
      sec: 0,
      min: 0,
      hr: 0,
    });
    setCurrentTime('');
  };

  return (
    <CardBody style={{ width: '90%' }}>
      <Container>
        <Row>
          <Button className="member-stopwatch mb-2 px-5">
            {`${time.hr < 10 ? 0 : ''}${time.hr} : ${time.min < 10 ? 0 : ''}${time.min} : ${
              time.sec < 10 ? 0 : ''
            }${time.sec}`}
          </Button>
        </Row>

        <Row className="justify-content-between mb-1">
          <Button className="member-start" onClick={start}>
            START
          </Button>
          <Button className="member-stop" onClick={stop}>
            STOP
          </Button>
        </Row>
        <Row className="mb-1">Start at: {currentTime}</Row>
        <Row className="mb-2">Task: </Row>
        <Row className="justify-content-center">
          <Button className="member-clear" onClick={clear}>
            CLEAR
          </Button>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;

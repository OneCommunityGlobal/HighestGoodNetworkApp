import { Button, CardBody, Row, Col, Container } from 'reactstrap';
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
  const [startButtonText, setStartButtonText] = useState('START');
  const [isStarted, setIsStarted] = useState(false);

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

  // const start = () => {
  //   if (!intervalId) {
  //     const id = setInterval(updateTimer, 1000);
  //     setIntervalId(id);

  //     if (!currentTime) {
  //       const date = moment();
  //       const hour = date.hours();
  //       const min = date.minutes();
  //       const sec = date.seconds();
  //       const ampm = hour >= 12 ? 'PM' : 'AM';
  //       const hour12 = hour >= 12 ? hour - 12 : hour;
  //       const ctime = `${hour12 < 10 ? 0 : ''}${hour12} : ${min < 10 ? 0 : ''}${min} : ${
  //         sec < 10 ? 0 : ''
  //       }${sec} ${ampm}`;
  //       setCurrentTime(ctime);
  //     }

  //     setStartButtonText('PAUSE');
  //     setIsStarted(true);
  //   }
  // };

  const startStop = () => {
    if (isStarted === true) {
      // pause state
      clearInterval(intervalId);
      setIntervalId('');

      setStartButtonText('START');
      setIsStarted(false);
    } else if (!intervalId) {
      const id = setInterval(updateTimer, 1000);
      setIntervalId(id);

      if (!currentTime) {
        const date = moment();
        const hour = date.hours();
        const min = date.minutes();
        const sec = date.seconds();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour >= 12 ? hour - 12 : hour;
        const ctime = `${hour12 < 10 ? 0 : ''}${hour12} : ${min < 10 ? 0 : ''}${min} : ${
          sec < 10 ? 0 : ''
        }${sec} ${ampm}`;
        setCurrentTime(ctime);
      }

      setStartButtonText('PAUSE');
      setIsStarted(true);
    }
  };

  const stop = () => {
    clearInterval(intervalId);
    setIntervalId('');
  };

  const clear = () => {
    clearInterval(intervalId);
    setIntervalId('');
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
          <Button className="member-stopwatch mb-2 px-5 ">
            {`${time.hr < 10 ? 0 : ''}${time.hr} : ${time.min < 10 ? 0 : ''}${time.min} : ${
              time.sec < 10 ? 0 : ''
            }${time.sec}`}
          </Button>
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

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button } from 'reactstrap'
import { startTimer, pauseTimer, updateTimer, getTimerData } from '../../actions/timer'
import TimeEntryForm from '../Timelog/TimeEntryForm'
import './Timer.css'

const Timer = () => {
  const data = {
    disabled: window.screenX <= 500,
    isTangible: window.screenX > 500
  }
  const userId = useSelector(state => state.auth.user.userid)
  const userProfile = useSelector(state => state.auth.user)
  const pausedAt = useSelector(state => state.timer.seconds)
  const dispatch = useDispatch()
  const alert = {
    va: true,
  }
  const [seconds, setSeconds] = useState(pausedAt)
  const [isActive, setIsActive] = useState(false)
  const [modal, setModal] = useState(false)

  const toggle = () => setModal(modal => !modal)

  const reset = () => {
    setSeconds(0)
    setIsActive(false)
  }

  const handleStart = async () => {
    await dispatch(getTimerData(userId));

    const status = await startTimer(userId, seconds)
    if ([9, 200, 2001].includes(status)) {
      setIsActive(true)
    }

    let maxtime = null

    if (seconds === 0 && alert.va) {
      setInterval(handleStop, 36000900)
      alert.va = !alert.va
    } else {
      clearInterval(maxtime)
    }
  }

  const handleUpdate = async () => {
    const status = await updateTimer(userId)
    if (status === 9) { setIsActive(false); }
    await dispatch(getTimerData(userId));
  }

  const handlePause = async () => {
    await dispatch(getTimerData(userId));
    const status = await pauseTimer(userId, seconds)
    if (status === 200 || status === 201) { setIsActive(false) }
  }

  const handleStop = async () => {
    await handlePause();
    if (!isActive){ toggle() }
  }

  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1)
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }
    return () => {
      clearInterval(interval)
    }
  }, [isActive])

  useEffect(() => {
    setSeconds(pausedAt)
  }, [pausedAt])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemainder = seconds % 60

  useEffect(()=>{
    if (minutes !== 0) {
      handleUpdate()
    }
  }, [minutes])

  return (
    <div className="timer mr-4 my-auto">
      <Button onClick={reset} color="secondary" className="mr-1 p-1 mt-1 align-middle">
        Clear
      </Button>
      <Badge className="mr-1 mt-1 align-middle">
        {hours}:{padZero(minutes)}:{padZero(secondsRemainder)}
      </Badge>
      <Button
        id='start'
        onClick={isActive ? handlePause : handleStart}
        color={isActive ? 'primary' : 'success'}
        className="ml-1 mt-1 p-1 align-middle"
      >
        {isActive ? 'Pause' : 'Start'}
      </Button>
      <Button
        onClick={seconds !== 0 ? handleStop : null}
        color="danger"
        className="ml-1 p-1 mt-1 align-middle"
      >
        Stop
      </Button>
      <TimeEntryForm
        edit={false}
        userId={userId}
        toggle={toggle}
        isOpen={modal}
        timer={{ hours, minutes }}
        data={data}
        userProfile = {userProfile}
        resetTimer={reset}
      />
    </div>
  )
}

const padZero = number => `0${number}`.slice(-2)

export default Timer

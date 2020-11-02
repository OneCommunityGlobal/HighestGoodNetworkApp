import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Badge, Button } from 'reactstrap'
import { startTimer, pauseTimer, stopTimer } from '../../actions/timer'
import TimeEntryForm from '../Timelog/TimeEntryForm'
import './Timer.css'
import { maxTime } from 'date-fns/esm'

const Timer = () => {
  const userId = useSelector(state => state.auth.user.userid)
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

  const handlePause = async event => {
    const status = await dispatch(pauseTimer(userId, seconds))
    if (status === 200 || status === 201) {
      setIsActive(false)
    }
  }
  const handleStop = async event => {
    const status = await dispatch(pauseTimer(userId, seconds))
    if (status === 200 || status === 201) {
      setIsActive(false)
      toggle()
    }
  }

  const handleStart = async event => {
    const status = await startTimer(userId, seconds)
    if (status === 200 || status === 201) {
      setIsActive(true)
    }

    let maxtime = null

    if (seconds === 0 && alert.va) {
      maxtime = setInterval(handleStop, 36000900)
      alert.va = !alert.va
    } else {
      clearInterval(maxtime)
    }
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
    return () => clearInterval(interval)
  }, [isActive, seconds])

  useEffect(() => {
    setSeconds(pausedAt)
  }, [pausedAt])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemainder = seconds % 60

  // const [seconds, setSeconds] = useState(pausedAt)

  return (
    <div className="timer mr-4 my-auto">
      <Button onClick={reset} color="secondary" className="mr-1 p-1 align-middle">
        Clear
      </Button>
      <Badge className="mr-1 align-middle">
        {hours}:{padZero(minutes)}:{padZero(secondsRemainder)}
      </Badge>
      <Button
        onClick={isActive ? handlePause : handleStart}
        color={isActive ? 'primary' : 'success'}
        className="ml-1 p-1 align-middle"
      >
        {isActive ? 'Pause' : 'Start'}
      </Button>
      <Button
        onClick={seconds !== 0 ? handleStop : null}
        color="danger"
        className="ml-1 p-1 align-middle"
      >
        Stop
      </Button>
      <TimeEntryForm
        edit={false}
        userId={userId}
        toggle={toggle}
        isOpen={modal}
        timer={{ hours, minutes }}
      />
    </div>
  )
}

const padZero = number => `0${number}`.slice(-2)

export default Timer

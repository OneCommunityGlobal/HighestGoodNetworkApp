import { ReadyState } from 'react-use-websocket';
import { BsXLg } from 'react-icons/bs';
import { FaSyncAlt } from 'react-icons/fa';
import cs from 'classnames';
import css from './Countdown.module.css';
import timerCss from './Timer.module.css';

export default function TimerStatus({
  readyState,
  toggleTimer,
  handleManualReconnect,
  isReconnecting,
}) {
  /*
  This is the status of the connection with the timer service
  We just use the readyState of the websocket connection to show the status
  */
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting to the timer service',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing the connection',
    [ReadyState.CLOSED]: 'The connection with the timer service is closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  /*
  Here is the component to show the timer status
  If the connection is not open we show the connection status
  If the connection is open and there is an error we show the error
  If the connection is open and there is no error we show the waiting message
  This component will be shown when the the connection is not open or there is an error
  or when there is no message from the server
  */
  const showReconnectButton = readyState !== ReadyState.OPEN && handleManualReconnect;

  return (
    <>
      <BsXLg className={cs(css.transitionColor, css.crossIcon)} onClick={toggleTimer} />
      <div className={css.timerStatus}>
        <div>{connectionStatus}</div>
        {showReconnectButton && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div
              title={isReconnecting ? 'Reconnecting...' : 'Reconnect'}
              style={{
                display: 'inline-block',
                cursor: isReconnecting ? 'not-allowed' : 'pointer',
              }}
            >
              <button
                type="button"
                className={cs(
                  timerCss.reconnectInlineBtn,
                  isReconnecting && timerCss.reconnectBtnDisabled,
                )}
                onClick={handleManualReconnect}
                disabled={isReconnecting}
                aria-label={isReconnecting ? 'Reconnecting...' : 'Reconnect'}
                title={isReconnecting ? 'Reconnecting...' : 'Reconnect'}
              >
                <FaSyncAlt
                  className={cs(timerCss.reconnectIcon, isReconnecting && timerCss.spin)}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

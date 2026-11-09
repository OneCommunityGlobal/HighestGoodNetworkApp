import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { loadTurnstileScript } from './turnstile';

/**
 * Renders the Cloudflare Turnstile widget. The parent supplies the site key (render this only
 * when a key is configured) and gets the token through onToken; token is '' when it expires,
 * errors or is reset. Call ref.reset() after a failed submit to get a fresh token.
 */
const TurnstileWidget = forwardRef(function TurnstileWidget({ siteKey, onToken, darkMode }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current('');
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // widget already gone; nothing to reset
        }
      }
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadTurnstileScript()
      .then(turnstile => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: darkMode ? 'dark' : 'light',
          callback: token => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => onTokenRef.current(''),
        });
      })
      .catch(() => {
        // Script blocked or offline: the server decides whether a missing token is acceptable.
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, darkMode]);

  return <div ref={containerRef} data-testid="turnstile-widget" />;
});

TurnstileWidget.propTypes = {
  siteKey: PropTypes.string.isRequired,
  onToken: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

TurnstileWidget.defaultProps = {
  darkMode: false,
};

export default TurnstileWidget;

# Timer Reconnect Feature - Testing Steps

## Overview
This document outlines the testing steps for the timer reconnect/refresh feature, which allows users to manually reconnect the timer WebSocket connection when it becomes disconnected.

## Prerequisites
- Timer service backend should be running
- Browser DevTools should be accessible (F12)
- Timer component should be visible in the application

---

## Test Case 1: Main Timer Preview - Reconnect Button

### Steps:
1. **Open the application** and ensure the timer is visible in the header
2. **Open Browser DevTools** (F12) → Go to **Network** tab
3. **Enable Request Blocking**:
   - Click the **⋮** (three dots) menu in Network tab
   - Select **"More tools"** → **"Request blocking"**
   - Click **"+ Add pattern"**
   - Enter pattern: `*timer-service*`
   - **Enable** the checkbox next to the pattern
4. **Refresh the page** (F5)
5. **Verify Disconnected State**:
   - The timer preview area should show **"Disconnected"** in red text
   - A **refresh icon** (circular arrows) should appear next to "Disconnected"
6. **Test Hover Tooltip**:
   - Hover over the refresh icon
   - Tooltip should display: **"Reconnect"**
7. **Test Reconnection**:
   - **Unblock** the timer-service pattern (uncheck the checkbox in Request Blocking)
   - Click the **refresh icon**
   - Wait a few seconds
   - Timer should reconnect and show the time display (e.g., "00:15:00")
   - The "Disconnected" message should disappear

### Expected Results:
- ✅ Disconnected state displays correctly
- ✅ Reconnect button is visible and clickable
- ✅ Hover tooltip shows "Reconnect"
- ✅ Reconnection works when service is available

---

## Test Case 2: Timer Dropdown - Reconnect Button

### Steps:
1. **Follow steps 1-4 from Test Case 1** to get into disconnected state
2. **Click on the timer icon** or the "Disconnected" preview area
3. **Verify Timer Dropdown Opens**:
   - A dropdown should appear showing the timer status
   - Should display: **"The connection with the timer service is closed"**
   - A **refresh icon** should be visible **centered** below the message
4. **Test Hover Tooltip**:
   - Hover over the refresh icon in the dropdown
   - Tooltip should display: **"Reconnect"**
5. **Test Reconnection from Dropdown**:
   - **Unblock** the timer-service pattern
   - Click the **refresh icon** in the dropdown
   - Wait a few seconds
   - Dropdown should show the timer countdown interface
   - Timer should be functional

### Expected Results:
- ✅ Timer dropdown opens even when disconnected
- ✅ Reconnect button is centered in the dropdown
- ✅ Hover tooltip shows "Reconnect"
- ✅ Reconnection works from the dropdown

---

## Test Case 3: Popout Timer - Reconnect Button

### Steps:
1. **Start the timer** (click play button)
2. **Open the popout timer** (click the expand/fullscreen icon)
3. **Block the timer-service** (follow steps 2-4 from Test Case 1)
4. **Wait for disconnection** (approximately 3-4 minutes):
   - Timer sends heartbeat every 60 seconds
   - After 3 failed heartbeats, it will disconnect
   - Popout should show: **"The connection with the timer service is closed"**
5. **Verify Reconnect Button**:
   - A **refresh icon** should be visible **centered** below the message
6. **Test Hover Tooltip**:
   - Hover over the refresh icon
   - Tooltip should display: **"Reconnect"**
7. **Test Reconnection**:
   - **Unblock** the timer-service pattern
   - Click the **refresh icon**
   - Wait a few seconds
   - Popout should reconnect and show the timer countdown

### Expected Results:
- ✅ Popout timer detects disconnection automatically
- ✅ Reconnect button appears when disconnected
- ✅ Hover tooltip shows "Reconnect"
- ✅ Reconnection works in popout window

---

## Test Case 4: Reconnecting State

### Steps:
1. **Get into disconnected state** (follow steps 1-4 from Test Case 1)
2. **Keep timer-service blocked**
3. **Click the refresh icon**
4. **Verify Reconnecting State**:
   - Refresh icon should **spin** (animated rotation)
   - Button should be **disabled** (not clickable)
   - Hover tooltip should show: **"Reconnecting..."**
5. **Unblock timer-service** while reconnecting
6. **Verify Connection**:
   - After a few seconds, connection should be established
   - Spinning animation should stop
   - Timer should display normally

### Expected Results:
- ✅ Reconnecting state shows spinning animation
- ✅ Button is disabled during reconnection
- ✅ Tooltip shows "Reconnecting..." during reconnection
- ✅ Connection succeeds when service becomes available

---

## Test Case 5: Clickable Disconnected Preview Area

### Steps:
1. **Get into disconnected state** (follow steps 1-4 from Test Case 1)
2. **Click on the "Disconnected" text area** (not just the icon)
3. **Verify**:
   - Timer dropdown should open
   - Cursor should show as pointer when hovering over the disconnected area
4. **Click the refresh button** inside the disconnected area
5. **Verify**:
   - Only the reconnect action happens (dropdown doesn't close)
   - Reconnection process starts

### Expected Results:
- ✅ Disconnected preview area is clickable
- ✅ Clicking opens the timer dropdown
- ✅ Clicking refresh button doesn't trigger dropdown toggle
- ✅ Both interactions work independently

---

## Test Case 6: Keyboard Accessibility

### Steps:
1. **Get into disconnected state**
2. **Tab to focus** on the disconnected preview area
3. **Press Enter**:
   - Timer dropdown should open
4. **Tab to focus** on the refresh button
5. **Press Enter**:
   - Reconnection should start

### Expected Results:
- ✅ Keyboard navigation works
- ✅ Enter key triggers appropriate actions
- ✅ Focus indicators are visible

---

## Alternative Testing Method (Without Request Blocking)

If Request Blocking doesn't work in your browser, you can:

1. **Stop the timer service backend** temporarily
2. **Wait for connection to fail** (or refresh page)
3. **Follow the same verification steps** as above
4. **Restart the timer service** to test reconnection

---

## Notes

- **Heartbeat Mechanism**: The timer sends heartbeat requests every 60 seconds when running. If 3 consecutive heartbeats fail (no response within 10 seconds each), it will automatically disconnect.
- **Reconnect Button Location**: 
  - Main timer preview: Next to "Disconnected" text
  - Timer dropdown: Centered below connection status message
  - Popout timer: Centered below connection status message
- **Tooltip Text**: 
  - Shows "Reconnect" when button is enabled
  - Shows "Reconnecting..." when actively reconnecting

---

## Known Issues / Edge Cases to Test

1. **Rapid clicking**: Click refresh button multiple times quickly - should only trigger one reconnection
2. **Network interruption during reconnection**: Block/unblock rapidly - should handle gracefully
3. **Multiple timer instances**: Test with both main timer and popout open simultaneously
4. **Browser refresh**: Refresh page while disconnected - should maintain disconnected state initially


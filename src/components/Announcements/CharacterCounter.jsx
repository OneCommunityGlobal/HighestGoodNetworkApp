import React from 'react';

const CharacterCounter = ({ currentLength, maxLength }) => {
  const isOverLimit = currentLength > maxLength;
  const percentage = (currentLength / maxLength) * 100;

  const getColor = () => {
    if (isOverLimit) return '#dc3545'; // Red
    if (percentage > 90) return '#ffc107'; // Yellow/warning
    return '#28a745'; // Green
  };

  return (
    <div
      style={{
        fontSize: '14px',
        fontWeight: '500',
        marginTop: '8px',
        color: getColor(),
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span style={{ fontWeight: '700', fontSize: '16px' }}>{currentLength}</span>
      <span>/</span>
      <span>{maxLength}</span>
      {isOverLimit && (
        <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: '600' }}>
          ⚠️ Exceeds limit by {currentLength - maxLength} characters!
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;

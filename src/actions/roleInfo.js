import React from 'react';
import { useDispatch } from 'react-redux';

const roleInfo = () => {
  const dispatch = useDispatch();
  
  const handleTextChange = (e) => {
    dispatch({ type: 'SET_ROLEINFO', payload: e.target.value });
  };
  
  return <input type="text" onChange={handleTextChange} />;
};

export default roleInfo;

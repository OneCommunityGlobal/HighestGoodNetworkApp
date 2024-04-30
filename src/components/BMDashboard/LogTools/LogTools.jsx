import { useEffect, useState } from 'react';
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Input,
  Button,
  InputGroup,
  Table,
} from 'reactstrap';
import './LogTools.css';
import { CloseButton } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'; // Import the caret down icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { fetchToolById } from 'actions/bmdashboard/toolActions';
import { fetchToolTypes, fetchReusableTypes } from '../../../actions/bmdashboard/invTypeActions';

function LogTools() {
  const tool = useSelector(state => state);

  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(fetchToolById(toolId));
    dispatch(fetchToolTypes);
    dispatch(fetchReusableTypes);
    console.log("first load. tool: ", tool)
  }, []);



  return (
    <div>Log tool coming soon</div>
  );
}

export default LogTools;

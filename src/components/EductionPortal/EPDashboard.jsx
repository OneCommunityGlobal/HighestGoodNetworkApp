import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useHistory } from 'react-router-dom'; // For React Router v5
import './EPDashboard.css';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt } from 'react-icons/fa';

export function EPDashboard() {
  return <h1>Welcome to Education Portal</h1>;
}

export default EPDashboard;

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';


function Inventory() {
  //  Use for implementing dark mode in the future
  const darkMode = useSelector(state => state.theme.darkMode);
  const location = useLocation();


  // Set the page title when the component mounts
  useEffect(() => {
    if (location.pathname.includes('/wbs')) {
      document.title = 'WBS Inventory'; // Set title for WBS Inventory
    } else if (location.pathname.includes('/inventory')) {
      document.title = 'Project Inventory'; // Set title for Project Inventory
    }
  }, [location.pathname]);

  return (
  <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
    <h1 style={{textAlign: "center", width: "100vw", paddingTop:"100px"}}>
      Nothing here yet! 😔
    </h1>
  </div>);
}

export default Inventory;

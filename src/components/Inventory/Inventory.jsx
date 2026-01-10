import { useSelector } from "react-redux";

function Inventory() {
  //  Use for implementing dark mode in the future
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
  <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
    <h1 style={{textAlign: "center", width: "100vw", paddingTop:"100px"}}>
      Nothing here yet! 😔
    </h1>
  </div>);
}

export default Inventory;

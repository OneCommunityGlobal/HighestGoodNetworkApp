import React from 'react';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

class DropdownMenuComp extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
  }

  toggle() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  render() {
    return (
      <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle caret>
          Dropdown
        </DropdownToggle>
        <DropdownMenu>
          {this.props.options}
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem>Some Action</DropdownItem>
          <DropdownItem disabled>Action (disabled)</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Foo Action</DropdownItem>
          <DropdownItem>Bar Action</DropdownItem>
          <DropdownItem>Quo Action</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default DropdownMenuComp;


// import React from 'react';
// import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// const DropdownMenu = (value, name, label, options, className, error, ...rest) => (

//   <div className={`form-group ${className}`}>
//     <label id="name" htmlFor={name}>{label}</label>

//     <select value={value} name={name} id={name} {...rest} className="form-control">
//       Please select a
//       {' '}
//       {label}
//       {options.map(item => (
//         <option value={item.projectId} key={item.projectId}>
//           {item.projectName}
//         </option>
//       ))}
//     </select>
//   </div>
// );
// export default DropdownMenu;

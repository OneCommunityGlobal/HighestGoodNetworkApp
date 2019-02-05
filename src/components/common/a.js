import Parent from "./parent.js";

class Child extends React.Component {
  constructor(props) {
    super(props);
  }

  click = () => {
    this.props.parentMethod();
  };

  render() {
      <div onClick={this.click}>Hello Child</div>
  }
}

class Parent extends React.Component {
  constructor(props) {
    super(props);
  }

  someMethod() {
    console.log("bar");
  }

  render() {
      <Child parentMethod={this.someMethod}>
Hello Parent,
{' '}
{this.props.children}
</Child>
  }
}

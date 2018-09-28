import React,{Component} from 'react';
import { FormGroup, Input, FormFeedback} from 'reactstrap';

class PasswordComp extends Component {
  constructor(){
    super();
    this.state={
      password:""
    }
    this.handleChange=this.handleChange.bind(this);
  }

  handleChange = async event => {
    const { target } = event;
    const value = target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
  };
  render() {
    const { password } = this.state;
    const {id} = this.props;
    return (
      <div>
        <FormGroup>
          <Input
            required
            type="password"
            name="password"
            id={id}
            placeholder={id}
            value={password}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormFeedback>Password should be minimum of 8 characters with atleast one capital,one small letter, one special charac,one number </FormFeedback>
      </div>
    );
  }
}
export default PasswordComp;

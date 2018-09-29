import React,{Component} from 'react';
import { FormGroup, Input, FormFeedback} from 'reactstrap';

class PasswordComp extends Component {
  constructor(){
    super();
    this.state={
      password:"",
      validate: {
        passwordState:""
      }
    }
    this.onChange=this.onChange.bind(this);
  }
  onChange(event){
    this.handleChange(event);
    this.validatePassword(event);
  }
  handleChange = async event => {
    const { target } = event;
    const value = target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
  };

  validatePassword(event){
    const passwordRegex =/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    
    const { validate } = this.state;
    if (passwordRegex.test(event.target.value)) {
      validate.passwordState = "has-success";
    } else {
      validate.passwordState = "has-danger";
    }
    this.setState({ validate });
  }
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
            valid={this.state.validate.passwordState === "has-success"}
            invalid={this.state.validate.passwordState === "has-danger"}
            onChange={
              this.onChange
            }
          />
          <FormFeedback>password should be at least 8 charcaters long with uppercase, lowercase and number/special char </FormFeedback>
        </FormGroup>
        
      </div>
    );
  }
}
export default PasswordComp;

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
    this.handleChangeandValidate=this.handleChangeandValidate.bind(this);
    this.pwdValueOnblur=this.pwdValueOnblur.bind(this);
  }
  handleChangeandValidate(event){
    this.handleChange(event);
    this.validatePassword(event);
    //this.props.passwordMatch(event.target.value);
  }
  handleChange = async event => {
    const { target } = event;
    const value = target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
    this.props.pwdValueOnchange && this.props.pwdValueOnchange(value);
    try{
    this.props.hasOwnProperty('passwordMismatch') && (this.props.passwordMismatch=false);
    }
    catch(e){

    }

  };

  validatePassword(event){
    const passwordRegex =/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    let { validate } = this.state;
   
    if (passwordRegex.test(event.target.value)) {
      validate.passwordState = "has-success";
    } else {
      validate.passwordState = "has-danger";
    }
    this.setState({ validate });
  }

  pwdValueOnblur(event){
    this.props.pwdValueOnblur && this.props.pwdValueOnblur(event.target.value);
  }
  handleError(){
    let errorMsg=false;
    let { validate } = this.state;

    if(this.props.passwordMismatch){
      //validate.passwordState='has-danger';
      errorMsg='Both password and confirm password must match';
      //this.setState({validate});
    }
    else{
      errorMsg='password should be at least 8 charcaters long with uppercase, lowercase and number/special char'
    }
    return errorMsg;
  }
  render() {
    let { password } = this.state;
    let {id} = this.props;
    let errorMsg = this.handleError();
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
            invalid={this.state.validate.passwordState === "has-danger" ||  this.props.passwordMismatch}
            onChange={
              this.handleChangeandValidate
            }
            onBlur={ this.pwdValueOnblur}
          />
          <FormFeedback>{errorMsg}</FormFeedback>
        </FormGroup>
        
      </div>
    );
  }
}
export default PasswordComp;

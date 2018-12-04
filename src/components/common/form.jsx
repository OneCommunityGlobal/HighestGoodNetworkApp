import React, { Component } from "react";
import Joi from "joi";
import _ from "lodash";
import Input from "../common/input";
import Dropdown from "./dropdown";
import Radio from "./radio"
import Image from "./image"
import FileUploadBase64 from "./fileUploadBase64"
import { Link } from 'react-router-dom'

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };
  handleChange = ({currentTarget:input}) => {
    
    let { data, errors } = { ...this.state };
    data[input.name] = input.value;
    const errorMessage = this.validateProperty(input.name, input.value);
    if (errorMessage) {
      errors[input.name] = errorMessage;
    } else {      
      delete errors[input.name];
    }
    this.setState({ data, errors });
  };
  validateProperty = (name, value) => {
    
    const obj = { [name]: value};
    const schema = { [name]: this.schema[name] };
    let refs = schema[name]._refs;
    if(refs)
    {
    refs.forEach(ref => {
      schema[ref] = this.schema[ref];
      obj[ref] = this.state.data[ref];
      
    });
    }
    const { error } = Joi.validate(obj, schema);
    if (!error) return null;
    return error.details[0].message;
  };

  validateForm = () => {
    let errors = {};
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;
    error.details.forEach(element => {
      errors[element.path[0]] = element.message;
    });

    const messages = _.groupBy(error.details, "path[0]");
    Object.keys(messages).forEach(key => {
      errors[key] = messages[key].map(item => item.message).join(". ");
    });
    return errors;
  };
  handleSubmit = e => {
    e.preventDefault();
    const errors = this.validateForm();
    this.setState({ errors: errors || {} });
    if (errors) return;
    this.doSubmit();
  };

  renderButton(label) {
    return (
      <button disabled={this.validateForm()} className="btn btn-primary">
        {label}
      </button>
    );
  }

  renderDropDown({name, label,options, ...rest})
  {

    const {data, errors} = {...this.state}
     return (
      <Dropdown
      name = {name}
      label = {label}
      options = {options}
      value = {data[name]}
      onChange = {e=> this.handleChange(e)}
      error = {errors[name]}
      {...rest}
      />
    )
  }

  renderInput({name, label, type = "text", ...rest}) {
    let { data, errors } = { ...this.state };
    return (
      <Input      
        id={name}
        name={name}
        type={type}
        onChange={e => this.handleChange(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      
      />
    );
  }
  renderRadio({name, label, type = "text", ...rest}){
    let { data, errors } = { ...this.state };
    return (
      <Radio      
        id={name}
        name={name}
        value = {data[name]}
        onChange={e => this.handleChange(e)}
        error={errors[name]}
        {...rest}
      
      />
    );
  }

  renderFileUploadBase64({name, ...rest})
  {
    let {  errors } = { ...this.state };

    return(
      <FileUploadBase64 id={name} name = {name} onUpload={e => this.handleChange(e) } {...rest} error={errors[name]}/>
    );

  }

  renderImage({name, label, ...rest}) {
    let { data, errors } = { ...this.state };
    return (
      <Image      
        id={name}
        name={name}
        onChange={e => this.handleChange(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      
      />
    );
  }

  renderLink({label, to, className})
  {
    return <Link to={to} className = {className}>{label}</Link>
  }
}

export default Form;

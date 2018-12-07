import React, { Component } from "react";
import Joi from "joi";
import _ from "lodash";
import Input from "../common/input";
import Dropdown from "./dropdown";
import Radio from "./radio"
import Image from "./image"
import FileUpload from "./fileUpload"
import { Link } from 'react-router-dom'
import TinyMCEEditor from './tinymceEditor'

class Form extends Component {
  state = {
    data: {},
    errors: {}    
  };
  prevState = {}

  handleCancel = ()=> this.setState(this.prevState)
  
  handleInput = ({currentTarget:input}) => {   
    this.handleState(input.name, input.value)
  };
  handleRichTextEditor= ({target})=>
  {
  let {id} = target
    this.handleState(id, target.getContent())

  }
  handleFileUpload = (e, readAsType= "data") => {
    const file = e.target.files[0];
    const reader = new FileReader();
    let name = e.target.name;
    if(file)
    { 
      switch (readAsType) {
        case "data":
        reader.readAsDataURL(file)         
          break;      
        default:
          break;
      }
          }
    reader.onload = ()=> this.handleState(name, reader.result);
  }

  handleState = (name, value)=>
  {   
    let {errors, data} = this.state;
    data[name] = value;
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) {
      errors[name] = errorMessage;
    } else {      
      delete errors[name];
    }
    this.setState({ data, errors });
  }

 
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

  renderRichTextEditor({name, ...rest})
  {
    const {data, errors} = {...this.state}
    return (
      <TinyMCEEditor
      name = {name}         
      value = {data[name]}
      onChange= {e=> this.handleRichTextEditor(e)}
      error = {errors[name]}
      {...rest}
      />
    )

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
      onChange = {e=> this.handleInput(e)}
      error = {errors[name]}
      {...rest}
      />
    )
  }

  renderInput({name, label, type = "text", ...rest}) {
    let { data, errors } = { ...this.state };
    return (
      <Input 
        name={name}
        type={type}
        onChange={e=> this.handleInput(e)}
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
      name={name}
        value = {data[name]}
        onChange={e => this.handleInput(e)}
        error={errors[name]}
        {...rest}
      
      />
    );
  }

  renderFileUpload({name, ...rest})
  {
    let {  errors } = { ...this.state };

    return(
      <FileUpload name ={name} onUpload={this.handleFileUpload} {...rest} error={errors[name]}/>
    );

  }

  renderImage({name, label, ...rest}) {
    let { data, errors } = { ...this.state };
    return (
      <Image 
        name={name}
        onChange={e=> this.handleInput(e)}
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

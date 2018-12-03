import React, { Component } from "react";
import Joi from "joi";
import _ from "lodash";
import Input from "../common/input";
import Textarea from "../common/Textarea";
import Dropdown from "./dropdown";

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  handleChange = ({ currentTarget: input }) => {
    let { data, errors } = { ...this.state };
    data[input.name] = input.value;

    const errorMessage = this.validateProperty(input.name, input.value);

    if (errorMessage) {
      errors[input.name] = errorMessage;
    } else {
      delete errors[input.name];
    }
    this.setState({ data, errors });
    console.log(this.state);
  };

  handleClick = () => {
    this.setState({
      data: {
        tangible: !this.state.data.tangible
      }
    });
  };

  validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
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

  renderButton(label, click) {
    return (
      <button
        disabled={this.validateForm()}
        onClick={click}
        className="btn btn-primary"
      >
        {label}
      </button>
    );
  }

  renderDropDown(name, label, options) {
    const { data, errors } = { ...this.state };

    return (
      <Dropdown
        name={name}
        label={label}
        options={options}
        value={data[name]}
        onChange={e => this.handleChange(e)}
        error={errors[name]}
      />
    );
  }

  renderInput(name, label, type, min, max) {
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
        min={min}
        max={max}
      />
    );
  }

  renderTextarea(name, label, rows, cols) {
    let { data, errors } = { ...this.state };

    return (
      <Textarea
        id={name}
        rows={rows}
        cols={cols}
        name={name}
        onChange={e => this.handleChange(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
      />
    );
  }

  renderCheckbox(name, label) {
    let { data, errors } = { ...this.state };

    return (
      <Input
        checked
        type="checkbox"
        name={name}
        label={label}
        value={data[name]}
        error={errors[name]}
        onClick={this.handleClick}
      />
    );
  }
}

export default Form;

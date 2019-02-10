import React, { Component } from "react";
import Joi from "joi";
import _ from "lodash";
import { Link } from "react-router-dom";
import Input from "./input";
import DropdownMenu from "./dropdown";
import Radio from "./radio";
import Image from "./image";
import FileUpload from "./fileUpload";
import TinyMCEEditor from "./tinymceEditor";
import CheckboxCollection from "./checkboxCollection";

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  resetForm = () => this.setState(_.cloneDeep(this.initialState));

  handleInput = ({ currentTarget: input }) => {
    this.handleState(input.name, input.value);
  };

  handleRichTextEditor = ({ target }) => {
    const { id } = target;
    this.handleState(id, target.getContent());
  };

  handleCollection = (collection, item, action, index = null) => {
    const data = this.state.data[collection] || [];
    switch (action) {
      case "create":
        data.push(item);
        break;
      case "edit":
        data[index] = item;
        break;
      case "delete":
        data.splice(index, 1);
        break;
      default:
        break;
    }
    this.handleState(collection, data);
  };

  handleInput = ({ currentTarget: input }) => {
    this.handleState(input.name, input.value);
  };

  handleState = (name, value) => {
    const { errors, data } = this.state;
    data[name] = value;
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) {
      errors[name] = errorMessage;
    } else {
      delete errors[name];
    }
    this.setState({ data, errors });
  };

  isStateChanged = () => !_.isEqual(this.state.data, this.initialState.data);

  validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const refs = schema[name]._refs;
    if (refs) {
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
    const errors = {};
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

  handleCheckbox = event => {
    const { data, errors } = { ...this.state };
    data[event.target.name] = event.target.checked.toString();
    this.setState({ data, errors });
  };

  resetForm = () => this.setState(_.cloneDeep(this.initialState));

  handleRichTextEditor = ({ target }) => {
    const { id } = target;
    this.handleState(id, target.getContent());
  };

  updateCollection = (collection, value) => {
    let data = this.state.data[collection] || [];
    data = value;
    this.handleState(collection, data);
  };

  handleCollection = (collection, item, action, index = null) => {
    const data = this.state.data[collection] || [];
    switch (action) {
      case "create":
        data.push(item);
        break;
      case "edit":
        data[index] = item;
        break;
      case "delete":
        data.splice(index, 1);
        break;
      default:
        break;
    }
    this.handleState(collection, data);
  };

  handleFileUpload = (e, readAsType = "data") => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const name = e.target.name;
    if (file) {
      switch (readAsType) {
        case "data":
          reader.readAsDataURL(file);
          break;
        default:
          break;
      }
    }
    reader.onload = () => this.handleState(name, reader.result);
  };

  isStateChanged = () => !_.isEqual(this.state.data, this.initialState.data);

  handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    const errors = this.validateForm();
    this.setState({ errors: errors || {} });
    if (errors) return;
    this.doSubmit();
  };

  renderButton(label, onClick) {
    return (
      <button
        disabled={this.validateForm()}
        onClick={onClick}
        className="btn btn-primary"
        type="button"
      >
        {label}
      </button>
    );
  }

  renderRichTextEditor({ name, label, ...rest }) {
    const { data, errors } = { ...this.state };
    return (
      <TinyMCEEditor
        name={name}
        value={data[name]}
        onChange={e => this.handleRichTextEditor(e)}
        error={errors[name]}
        {...rest}
      />
    );
  }

  renderDropDown({ name, label, options, ...rest }) {
    const { data, errors } = { ...this.state };
    return (
      <DropdownMenu
        name={name}
        label={label}
        options={options}
        value={data[name]}
        onChange={e => this.handleInput(e)}
        error={errors[name]}
        {...rest}
      />
    );
  }

  renderInput({ name, label, type, min, max, ...rest }) {
    const { data, errors } = { ...this.state };
    return (
      <Input
        min={min}
        max={max}
        name={name}
        type={type}
        onChange={e => this.handleInput(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      />
    );
  }

  renderCheckbox(name, label, type) {
    const { data, errors } = { ...this.state };
    // doesn't initialize the time entry object properly yet
    return (
      <Input
        id={name}
        name={name}
        type={type}
        onChange={e => this.handleCheckbox(e)}
        value={data[name]}
        label={label}
        errors={errors}
      />
    );
  }

  renderFileUpload({ name, ...rest }) {
    const { errors } = { ...this.state };
    return (
      <FileUpload
        name={name}
        onUpload={this.handleFileUpload}
        {...rest}
        error={errors[name]}
      />
    );
  }

  renderCheckboxCollection({ collectionName, ...rest }) {
    const { errors } = { ...this.state };
    return <CheckboxCollection error={errors[collectionName]} {...rest} />;
  }

  renderImage({ name, label, ...rest }) {
    const { data, errors } = { ...this.state };
    return (
      <Image
        name={name}
        onChange={e => this.handleInput(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      />
    );
  }

  renderRadio({ name, label, type = "text", ...rest }) {
    const { data, errors } = { ...this.state };
    return (
      <Radio
        name={name}
        value={data[name]}
        onChange={e => this.handleInput(e)}
        error={errors[name]}
        {...rest}
      />
    );
  }

  renderLink({ label, to, className }) {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  }
}

export default Form;

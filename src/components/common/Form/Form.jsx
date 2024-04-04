import React, { useState, Component } from 'react';
import Joi from 'joi';
import { cloneDeep, isEqual, groupBy } from 'lodash';
import Input from '../Input';
import Dropdown from '../Dropdown';
import Radio from '../Radio/';
import Image from '../Image';
import FileUpload from '../FileUpload';
import { Link } from 'react-router-dom';
import TinyMCEEditor from '../TinyceEditor/tinymceEditor';
import CheckboxCollection from '../CheckboxCollection';
import { boxStyle } from 'styles';

/* const Form = () => {
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setData({});
    setErrors({});
  };

  const handleInput = ({ currentTarget: input }) => {
    handleState(input.name, input.value);
  };

  const handleRichTextEditor = ({ target }) => {
    let { id } = target;
    handleState(id, target.getContent());
  };

  const handleCollection = (collection, item, action, index = null) => {
    let data = data[collection] || [];
    switch(action){
      case 'create':
        data.push(item);
        break;
      case 'edit':
        data[index] = item;
        break;
      case 'delete':
        data.splice(index, 1);
        break;
      default:
        break;
    }
    handleState(collection, data);
  };

  const handleFileUpload = (e, readAsType = 'data') => {
    const file = e.target.files[0];
    const reader = new FileReader();
    let name = e.target.name;
    if (file) {
      switch (readAsType) {
        case 'data':
          reader.readAsDataURL(file);
          break;
        default:
          break;
      }
    }
    reader.onload = () => handleState(name, reader.result);
  };

  const handleState = (name, value) => {
    data[name] = value;
    const errorMessage = validateProperty(name, value);
    if (errorMessage) {
      errors[name] = errorMessage;
    } else {
      delete errors[name];
    }
    setData(data);
    setErrors(errors);
  }; 
  
  const isStateChanged = () => !isEqual(data, {});

  const validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: schema[name] };
    let refs = schema[name]._refs;
    if (refs) {
      refs.forEach((ref) => {
        schema[ref] = schema[ref];
        obj[ref] = data[ref];
      });
    }
    const { error } = Joi.validate(obj, schema);
    if (!error) return null;
    return error.details[0].message;
  };

  const validateForm = () => {
    let errors = {};
    const options = { abortEarly: false };
    const { error } = Joi.validate(data, schema, options);
    if (!error) return null;
    error.details.forEach((element) => {
      errors[element.path[0]] = element.message;
    });

    const messages = groupBy(error.details, 'path[0]');
    Object.keys(messages).forEach((key) => {
      errors[key] = messages[key].map((item) => item.message).join('. ');
    });
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const errors = validateForm();
    setErrors({ errors: errors || {} });
    if (errors) return;
    doSubmit();
  };

  const renderButton = (label) => {
    return (
      <button disabled={validateForm()} className="btn btn-primary">
        {label}
      </button>
    );
  };

  const renderRichTextEditor = ({ name, ...rest }) => {
    return (
      <TinyMCEEditor
        name={name}
        value={data[name]}
        onChange={(e) => handleRichTextEditor(e)}
        error={errors[name]}
        {...rest}
      />
    );
  };

  const renderDropDown = ({ name, label, options, ...rest }) => {
    return (
      <Dropdown
        name={name}
        label={label}
        options={options}
        value={data[name]}
        onChange={(e) => handleInput(e)}
        error={errors[name]}
        {...rest}
      />
    );
  };

  const renderInput = ({ name, label, type = 'text', ...rest }) => {
    return (
      <Input
        name={name}
        type={type}
        onChange={(e) => handleInput(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      />
    );
  };

  const renderRadio = ({ name, label, type = 'text', ...rest }) => {
    return (
      <Radio
        name={name}
        value={data[name]}
        onChange={(e) => handleInput(e)}
        error={errors[name]}
        {...rest}
      />
    );
  };

  const renderFileUpload = ({ name, ...rest }) => {
    return (
      <FileUpload name={name} onUpload={this.handleFileUpload} {...rest} error={errors[name]} />
    );
  };

  const renderCheckboxCollection = ({ collectionName, ...rest }) => {
    return <CheckboxCollection error={errors[collectionName]} {...rest} />;
  }

  const renderImage = ({ name, label, ...rest }) => {
    return (
      <Image
        name={name}
        onChange={(e) => handleInput(e)}
        value={data[name]}
        label={label}
        error={errors[name]}
        {...rest}
      />
    );
  };

  const renderLink = ({ label, to, className }) => {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  };
}; */

class Form extends Component {
  state = {
    data: {},
    errors: {},
  };

  schema = {
    test: Joi.string().required(),
    testEditor: Joi.string().required(),
    testDropdown: Joi.string().required(),
    testRadio: Joi.string().required(),
    testCheckbox: Joi.boolean(),
    testCollection: Joi.array()
      .items(Joi.string())
      .min(1)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(6)
      .required(),
    someField: Joi.string().required(),
  };

  resetForm = () => this.setState(cloneDeep(this.initialState));

  handleInput = ({ currentTarget: input }) => {
    this.handleState(input.name, input.value);
  };
  handleRichTextEditor = ({ target }) => {
    let { id } = target;
    this.handleState(id, target.getContent());
  };

  handleCollection = (collection, item, action, index = null) => {
    let data = this.state.data[collection] || [];
    switch (action) {
      case 'create':
        data.push(item);
        break;
      case 'edit':
        data[index] = item;
        break;
      case 'delete':
        data.splice(index, 1);
        break;
      default:
        break;
    }
    this.handleState(collection, data);
  };

  handleFileUpload = (e, readAsType = 'data') => {
    const file = e.target.files[0];
    const reader = new FileReader();
    let name = e.target.name;
    if (file) {
      switch (readAsType) {
        case 'data':
          reader.readAsDataURL(file);
          break;
        default:
          break;
      }
    }
    reader.onload = () => this.handleState(name, reader.result);
  };

  handleState = (name, value) => {
    let { errors, data } = this.state;
    data[name] = value;
    const errorMessage = this.validateProperty(name, value);
    if (errorMessage) {
      errors[name] = errorMessage;
    } else {
      delete errors[name];
    }
    this.setState({ data, errors });
  };

  isStateChanged = () => !isEqual(this.state.data, this.initialState.data);

  validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    let refs = schema[name]._refs;
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
    let errors = {};
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);

    if (!error) return null;
    error.details.forEach(element => {
      errors[element.path[0]] = element.message;
    });

    const messages = groupBy(error.details, 'path[0]');
    Object.keys(messages).forEach(key => {
      errors[key] = messages[key].map(item => item.message).join('. ');
    });
    return errors;
  };

  doSubmit = () => {
    // Here you would typically handle the form submission.
    //console.log("Form submitted with data");
  };
  handleSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    const errors = this.validateForm();
    this.setState({ errors: errors || {} });
    if (errors) return;
    this.doSubmit();
  };

  renderButton(label) {
    return (
      <button disabled={this.validateForm()} className="btn btn-primary" style={boxStyle}>
        {label}
      </button>
    );
  }

  renderRichTextEditor({ name, ...rest }) {
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
      <Dropdown
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

  renderInput({ name, label, type = 'text', ...rest }) {
    let { data, errors } = { ...this.state };
    return (
      <Input
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
  renderRadio({ name, label, type = 'text', ...rest }) {
    let { data, errors } = { ...this.state };
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

  renderFileUpload({ name, ...rest }) {
    let { errors } = { ...this.state };
    return (
      <FileUpload name={name} onUpload={this.handleFileUpload} {...rest} error={errors[name]} />
    );
  }

  renderCheckboxCollection({ collectionName, ...rest }) {
    let { errors } = { ...this.state };
    return <CheckboxCollection error={errors[collectionName]} {...rest} />;
  }

  renderImage({ name, label, ...rest }) {
    let { data, errors } = { ...this.state };
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

  renderLink({ label, to, className }) {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  }
}

export default Form;

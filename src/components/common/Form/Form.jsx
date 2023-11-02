/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unused-class-component-methods */
import { Component } from 'react';
import Joi from 'joi';
import { cloneDeep, isEqual, groupBy } from 'lodash';
import { Link } from 'react-router-dom';
import { boxStyle } from 'styles';
import Input from '../Input';
import Dropdown from '../Dropdown';
import Radio from '../Radio';
import Image from '../Image';
import FileUpload from '../FileUpload';
import TinyMCEEditor from '../TinyceEditor/tinymceEditor';
import CheckboxCollection from '../CheckboxCollection';

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
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      errors: {},
    };
  }

  resetForm = () => this.setState(cloneDeep(this.initialState));

  handleInput = ({ currentTarget: input }) => {
    this.handleState(input.name, input.value);
  };

  handleRichTextEditor = ({ target }) => {
    const { id } = target;
    this.handleState(id, target.getContent());
  };

  handleCollection = (collection, item, action, index = null) => {
    // const data = this.state.data[collection] || [];
    const { data } = this.state; // Destructure data from state
    switch (action) {
      case 'create':
        data[collection].push(item);
        break;
      case 'edit':
        data[collection][index] = item;
        break;
      case 'delete':
        data[collection].splice(index, 1);
        break;
      default:
        break;
    }
    this.handleState(collection, data);
  };

  handleFileUpload = (e, readAsType = 'data') => {
    const file = e.target.files[0];
    const reader = new FileReader();
    const { name } = e.target;
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

  isStateChanged = () => {
    const { data } = this.state; // Destructure data from state
    return !isEqual(data, this.initialState.data);
  };

  validateProperty = (name, value) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };
    const refs = schema[name]._refs;
    if (refs) {
      refs.forEach(ref => {
        schema[ref] = this.schema[ref];
        const { data } = this.state;
        obj[ref] = data[ref];
      });
    }
    const { error } = Joi.validate(obj, schema);
    if (!error) return null;
    return error.details[0].message;
  };

  validateForm = () => {
    const errors = {};
    const options = { abortEarly: false };
    const { data } = this.state;
    const { error } = Joi.validate(data, this.schema, options);

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
      // eslint-disable-next-line react/button-has-type
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
    const { data, errors } = { ...this.state };
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

  // eslint-disable-next-line no-unused-vars
  renderRadio({ name, label, type = 'text', ...rest }) {
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

  renderFileUpload({ name, ...rest }) {
    const { errors } = { ...this.state };
    return (
      <FileUpload name={name} onUpload={this.handleFileUpload} {...rest} error={errors[name]} />
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

  // eslint-disable-next-line class-methods-use-this
  renderLink({ label, to, className }) {
    return (
      <Link to={to} className={className}>
        {label}
      </Link>
    );
  }
}

export default Form;

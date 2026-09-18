/* eslint-disable react/no-unused-class-component-methods */
/* eslint-disable react/jsx-props-no-spreading */
import { Component } from 'react';
import Joi from 'joi';
import { cloneDeep, isEqual, groupBy } from 'lodash';
import { Link } from 'react-router-dom';
import { boxStyle, boxStyleDark } from '~/styles';
import Input from '../Input';
import Dropdown from '../Dropdown';
import Radio from '../Radio';
import Image from '../Image';
import FileUpload from '../FileUpload';
import TinyMCEEditor from '../TinyceEditor/tinymceEditor';
import CheckboxCollection from '../CheckboxCollection';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      errors: {},
    };

    // Default schema — overridden by each derived form
    this.schema = {
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

    // ─── Reset Form ──────────────────────────────────────────────
    this.resetForm = () => this.setState(cloneDeep(this.initialState));

    // ─── Input Handlers ──────────────────────────────────────────
    this.handleInput = ({ currentTarget: input }) => {
      this.handleState(input.name, input.value);
    };

    this.handleRichTextEditor = ({ target }) => {
      const { id } = target;
      this.handleState(id, target.getContent());
    };

    this.handleCollection = (collection, item, action, index = null) => {
      const data = this.state.data[collection] || [];
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

    // ─── File Upload ─────────────────────────────────────────────
    this.handleFileUpload = (e, readAsType = 'data') => {
      const file = e.target.files[0];
      const reader = new FileReader();
      const { name } = e.target;

      if (!file) return;

      reader.onload = event => {
        const result = event.target.result;
        this.handleState(name, {
          data: result,
          name: file.name,
          type: file.type,
        });
      };

      if (readAsType === 'data') {
        reader.readAsDataURL(file);
      }
    };

    // ─── Generic State Update ───────────────────────────────────
    this.handleState = (name, value) => {
      const { errors, data } = this.state;
      data[name] = value;

      Object.keys(data).forEach(field => {
        const errorMessage = this.validateProperty(field, data[field]);
        if (errorMessage) {
          errors[field] = errorMessage;
        } else {
          delete errors[field];
        }
      });

      this.setState({ data, errors });
    };

    // ─── Utility ────────────────────────────────────────────────
    this.isStateChanged = () => !isEqual(this.state.data, this.initialState?.data);

    // ─── Validation (Modern Joi v18) ─────────────────────────────
    this.validateProperty = (name, value) => {
      if (!this.schema[name]) return null;

      // Build minimal schema
      const fieldSchema = Joi.object({ [name]: this.schema[name] });
      const obj = { [name]: value };

      // Joi now resolves refs internally (no manual _refs needed)
      const { error } = fieldSchema.validate(obj, { abortEarly: false });

      if (!error) return null;
      const detail = error.details.find(d => d.path[0] === name);
      return detail ? detail.message : null;
    };

    this.validateForm = () => {
      const options = { abortEarly: false };
      const { error } = Joi.object(this.schema).validate(this.state.data, options);
      if (!error) return null;

      const errors = {};
      const messages = groupBy(error.details, 'path[0]');
      Object.keys(messages).forEach(key => {
        errors[key] = messages[key].map(item => item.message).join('. ');
      });
      return errors;
    };

    // ─── Submission ─────────────────────────────────────────────
    this.doSubmit = () => {
      // To be implemented in subclasses
    };

    this.handleSubmit = e => {
      e.preventDefault();
      e.stopPropagation();
      const errors = this.validateForm();
      this.setState({ errors: errors || {} });
      if (errors) return;
      this.doSubmit();
    };
  }

  // ─── UI Rendering Helpers ─────────────────────────────────────

  renderButton({ label, darkMode }) {
    return (
      <button
        type="submit"
        disabled={this.validateForm()}
        className="btn btn-primary"
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {label}
      </button>
    );
  }

  renderRichTextEditor({ name, ...rest }) {
    const { data, errors } = this.state;
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
    const { data, errors } = this.state;
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

  renderInput({ name, label, type = 'text', darkMode, ...rest }) {
    const { data, errors } = this.state;
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

  renderRadio({ name, ...rest }) {
    const { data, errors } = this.state;
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
    const { errors } = this.state;
    return (
      <FileUpload name={name} onUpload={this.handleFileUpload} {...rest} error={errors[name]} />
    );
  }

  renderCheckboxCollection({ collectionName, ...rest }) {
    const { errors } = this.state;
    return <CheckboxCollection error={errors[collectionName]} {...rest} />;
  }

  renderImage({ name, label, ...rest }) {
    const { data, errors } = this.state;
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

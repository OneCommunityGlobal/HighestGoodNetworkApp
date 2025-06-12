import { useState } from 'react';
import Select from 'react-select';
import { MdOutlinePersonAddAlt1 } from 'react-icons/md';
import './AddTeamMember.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';

function AddTeamMember() {
  const initialState = {
    firstName: '',
    lastName: '',
    role: null,
    roleSpecify: '',
    team: null,
    teamSpecify: '',
    email: '',
    countryCode: '+1',
    phone: '',
    errors: {},
  };

  const [formData, setFormData] = useState(initialState);

  const optionsRole = [
    { value: 'carpenter', label: 'Carpenter' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'role', label: 'Role' },
    { value: 'other', label: 'Other' },
  ];

  const optionsTeam = [
    { value: 'xyz_carpentry', label: 'XYZ Carpentry' },
    { value: 'abc_builders', label: 'ABC Builders' },
    { value: 'other', label: 'Other' },
  ];

  const countryCodes = [
    { value: '+1', label: '+1 (USA/Canada)' },
    { value: '+44', label: '+44 (UK)' },
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (option, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: option,
      [`${field}Specify`]: option?.value === 'other' ? prev[`${field}Specify`] : '',
    }));
  };

  const formatPhoneNumber = value => {
    const phone = value.replace(/\D/g, '');
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.role) errors.role = 'Role selection is required';
    if (!formData.team) errors.team = 'Team selection is required';
    if (formData.role?.value === 'other' && !formData.roleSpecify.trim()) {
      errors.roleSpecify = 'Please specify the role';
    }
    if (formData.team?.value === 'other' && !formData.teamSpecify.trim()) {
      errors.teamSpecify = 'Please specify the team';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    return errors;
  };

  const createTeamMember = async memberData => {
    const response = await axios.post(ENDPOINTS.BM_EXTERNAL_TEAM, memberData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormData(prev => ({
        ...prev,
        errors,
      }));
      return;
    }

    try {
      const memberData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role?.value === 'other' ? formData.roleSpecify : formData.role?.value,
        roleSpecify: formData.roleSpecify,
        team:
          formData.team?.value === 'other'
            ? 'External Team - Non-volunteers'
            : formData.team?.value,
        teamSpecify: formData.teamSpecify,
        email: formData.email,
        countryCode: formData.countryCode,
        phone: formData.phone.replace(/\D/g, ''),
      };

      const response = await createTeamMember(memberData);

      if (response.success) {
        setFormData(initialState);
        /* eslint-disable-next-line no-console */
        console.log('Form submitted:', memberData);
        toast.success('Team member created successfully!');
      }
    } catch (error) {
      toast.error('Failed to create team member. Please try again.');
    }
  };

  return (
    <div className="container-add">
      <div className="icon-add-person">
        <MdOutlinePersonAddAlt1 size={90} />
        <h1 className="title-member">Create new team member</h1>
      </div>

      <div className="name-container">
        <div className="input-name">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            className={formData.errors.firstName ? 'error' : ''}
          />
          {formData.errors.firstName && (
            <span className="error-message">{formData.errors.firstName}</span>
          )}
        </div>

        <div className="input-name">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            className={formData.errors.lastName ? 'error' : ''}
          />
          {formData.errors.lastName && (
            <span className="error-message">{formData.errors.lastName}</span>
          )}
        </div>
      </div>

      <div className="role-container">
        <div className="role-input">
          <label htmlFor="role">Roles</label>
          <Select
            id="role"
            options={optionsRole}
            value={formData.role}
            onChange={option => handleSelectChange(option, 'role')}
            className={formData.errors.role ? 'error' : ''}
          />
          {formData.errors.role && <span className="error-message">{formData.errors.role}</span>}
        </div>
        <div className="role-input">
          <label>Specify Role</label>
          <input
            name="roleSpecify"
            type="text"
            value={formData.roleSpecify}
            onChange={handleInputChange}
            className={formData.errors.roleSpecify ? 'error' : ''}
          />
          {formData.errors.roleSpecify && (
            <span className="error-message">{formData.errors.roleSpecify}</span>
          )}
        </div>
      </div>

      <div className="team-container">
        <div className="team-input">
          <label htmlFor="team">Teams</label>
          <Select
            id="team"
            options={optionsTeam}
            value={formData.team}
            onChange={option => handleSelectChange(option, 'team')}
            className={formData.errors.team ? 'error' : ''}
          />
          {formData.errors.team && <span className="error-message">{formData.errors.team}</span>}
        </div>
        <div className="team-input">
          <label>Specify Team</label>
          <input
            name="teamSpecify"
            type="text"
            value={formData.teamSpecify}
            onChange={handleInputChange}
            className={formData.errors.teamSpecify ? 'error' : ''}
          />
          {formData.errors.teamSpecify && (
            <span className="error-message">{formData.errors.teamSpecify}</span>
          )}
        </div>
      </div>

      <div className="contact-info">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={formData.errors.email ? 'error' : ''}
        />
        {formData.errors.email && <span className="error-message">{formData.errors.email}</span>}

        <div className="phone-input-group">
          <Select
            options={countryCodes}
            value={countryCodes.find(code => code.value === formData.countryCode)}
            onChange={option => handleSelectChange(option, 'countryCode')}
            className="country-code-select"
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={e => {
              const formatted = formatPhoneNumber(e.target.value);
              handleInputChange({
                target: {
                  name: 'phone',
                  value: formatted,
                },
              });
            }}
            placeholder="123-456-7890"
          />
        </div>
        {formData.errors.phone && <span className="error-message">{formData.errors.phone}</span>}
      </div>

      <div className="submit-cancel">
        <button type="button" className="cancel-button" onClick={() => setFormData(initialState)}>
          Cancel
        </button>

        <button type="submit" className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default AddTeamMember;
